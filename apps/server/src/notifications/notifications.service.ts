import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AndroidConfig,
  ApnsConfig,
  Message,
  Notification,
  WebpushConfig,
} from 'firebase-admin/lib/messaging/messaging-api';
import { firebaseMessage } from 'src/app.firebase';
import { configs } from 'src/config/config';
import { mustBeObjectId, withMongoQuery } from 'src/database/database.utils';
import { DevicesService } from 'src/devices/devices.service';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { ClientQuery, DatabaseName } from '../database/database.types';
import {
  EventChannel,
  EventDataActionType,
  EventType,
} from '../events/events.types';
import { parseFileUrl } from '../files/files.utils';
import { AppLocale } from '../lang/lang.types';
import { translate } from '../lang/lang.utils';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceDefaultRoleId } from '../workspace-roles/workspace-roles.types';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { NotificationEntity } from './notifications.entity';
import {
  CreateMutilpleNotificationDto,
  CreateNotificationDto,
  NotificationStatus,
  NotificationType,
  SendNotificationInput,
  UserNotificationStat,
} from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity, DatabaseName.MONGO)
    private repository: MongoRepository<NotificationEntity>,
    private devices: DevicesService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private workspaceMembers: WorkspaceMembersService,
    private workspaces: WorkspacesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async list(args: WithWorkspaceArgs<{ query?: ClientQuery }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['userId', 'status', 'type'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async bindData(notification: NotificationEntity, locale?: AppLocale) {
    notification.title = translate(
      notification.title,
      locale,
      notification.titleParams,
    );
    notification.body = translate(
      notification.body,
      locale,
      notification.bodyParams,
    );
    return notification;
  }

  async create(dto: CreateNotificationDto) {
    const member = await this.workspaceMembers.get(dto);

    const notification = new NotificationEntity();
    notification.title = dto.title;
    notification.titleParams = dto.titleParams;
    notification.body = dto.body;
    notification.bodyParams = dto.bodyParams;
    notification.userId = dto.userId;
    notification.workspaceId = dto.workspaceId;
    notification.route = dto.route;
    notification.image = dto.image;
    notification.type = dto.type || NotificationType.INFO;
    notification.status = NotificationStatus.JUST_CREATED;
    notification.icon = dto.icon;

    const persist = typeof dto.persist === 'boolean' ? dto.persist : true;
    if (persist) await this.repository.save(notification);

    // Send notification to device
    const devices = await this.devices.getByUserId(member.userId);
    devices.forEach((device) => {
      if (device.notificationToken) {
        this.queueProducers.sendNotification({
          notification,
          deviceId: device._id.toString(),
          token: device.notificationToken,
          note: `Send notification to ${member.name} #${member.userId} > Device #${device._id.toString()}`,
        });
      }
    });

    const eventData = await this.bindData(notification, member.locale);

    this.queueProducers.captureEvent({
      userId: dto.userId,
      type: EventType.NOTIFICATION_NEW,
      actionType: EventDataActionType.CREATE,
      workspaceId: notification.workspaceId,
      ref: notification._id.toString(),
      data: eventData,
      channel: EventChannel.PERSONAL,
    });

    return notification;
  }

  async createMultiple(dto: CreateMutilpleNotificationDto) {
    const ignoreUserIds = (dto.ignoreUserIds || []).filter((v) => !!v);

    const persist = typeof dto.persist === 'boolean' ? dto.persist : true;

    // Send notification to related users
    const userIds = [...new Set(dto.userIds)]
      .filter((v) => !!v)
      .filter((v) => !ignoreUserIds.includes(v));

    // Send notification to related users
    await Promise.all(
      userIds.map((userId) =>
        this.create({
          ...dto,
          userId,
          workspaceId: dto.workspaceId,
          icon: dto.icon,
          persist,
        }),
      ),
    );

    if (!dto.ignoreAdmin) {
      // Send notification to all admins
      const members = await this.workspaceMembers
        .getAll(dto.workspaceId)
        .catch(() => []);

      const adminUserIds = members
        .filter(
          (v) =>
            v.roleIds &&
            v.roleIds.some((roleId: string) =>
              [
                WorkspaceDefaultRoleId.OWNER,
                WorkspaceDefaultRoleId.ADMIN,
              ].includes(roleId as any),
            ),
        )
        .map((v) => v.userId)
        .filter((v) => !ignoreUserIds.includes(v))
        .filter((v) => !userIds.includes(v));

      await Promise.all(
        adminUserIds.map((admin) =>
          this.create({
            ...dto,
            userId: admin,
            workspaceId: dto.workspaceId,
            persist,
          }),
        ),
      );
    }
  }

  async get(_id: string) {
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id) },
    });
    if (!data) throw new NotFoundException(AppMessage.NOTIFICATION_NOT_FOUND);
    return data;
  }

  async send(dto: SendNotificationInput) {
    const { notification, token, deviceId } = dto;

    const [workspace, device] = await Promise.all([
      this.workspaces.get(notification.workspaceId),
      this.devices.get(deviceId),
    ]);

    const locale = device.locale || workspace.locale;

    const allWorkspaceMembers = await this.workspaceMembers.list({
      query: { userId: notification.userId },
      workspaceId: notification.workspaceId,
    });

    const member = allWorkspaceMembers.data.find(
      (v) => v.workspaceId === notification.workspaceId,
    );

    const appIcon = parseFileUrl(workspace.appIcon);
    const workspaceLogo = parseFileUrl(workspace.logo);
    const notificationImage = parseFileUrl(notification.image);
    const imageUrl = parseFileUrl(
      notificationImage || appIcon || workspaceLogo,
    );

    let title = translate(notification.title, locale, notification.titleParams);
    const body = translate(notification.body, locale, notification.bodyParams);

    if (allWorkspaceMembers.data.length > 1 && member) {
      title = `[${member.workspace.name}] ${title}`;
    }

    let notificationConfig: Notification = {
      title,
      body,
    };

    let androidConfig: AndroidConfig = {
      notification: {},
      fcmOptions: {},
    };

    let apnsConfig: ApnsConfig = {
      payload: {
        aps: {
          mutableContent: true,
        },
      },
      fcmOptions: {},
    };

    let webpushConfig: WebpushConfig = {
      headers: {},
      fcmOptions: {
        link: `${configs.APP_URL}${notification.route}?w=${notification.workspaceId}`,
      },
      data: { raw: JSON.stringify(notification) },
    };

    if (!!imageUrl) {
      notificationConfig.imageUrl = imageUrl;
      androidConfig.notification.imageUrl = imageUrl;
      androidConfig.notification.icon = imageUrl;
      apnsConfig.fcmOptions.imageUrl = imageUrl;
      webpushConfig.headers.image = imageUrl;
    }

    const message: Message = {
      token,
      notification: notificationConfig,
      android: androidConfig,
      apns: apnsConfig,
      webpush: webpushConfig,
      data: { raw: JSON.stringify(notification) },
    };

    // Send notification by FCM
    return this.sendByFcm(message)
      .then((response) => {
        return {
          success: true,
          response,
          notification,
          deviceId,
        };
      })
      .catch(async (error) => {
        const errorCode =
          typeof error === 'object' && error.errorInfo?.code
            ? error.errorInfo?.code
            : '';
        if (errorCode === 'messaging/registration-token-not-registered') {
          await this.devices.removeNotificationToken(device);
          return {
            success: false,
            errorCode: 'messaging/registration-token-not-registered',
          };
        }

        logger.error(error, {
          case: `Failed to send notification`,
        });

        throw error;
      });
  }

  async sendByFcm(message: Message) {
    return firebaseMessage.send(message).then((result) => ({ result }));
  }

  async getUserStat(
    member: WorkspaceMember,
    ws: WorkspaceEntity,
  ): Promise<UserNotificationStat> {
    const unListViewed = await this.repository.count({
      userId: member.userId,
      status: NotificationStatus.JUST_CREATED,
      workspaceId: ws._id.toString(),
    });

    const count = await this.repository.count({
      userId: member.userId,
      workspaceId: ws._id.toString(),
    });

    return { unListViewed, count };
  }

  async markAllAsReaded(member: WorkspaceMember) {
    const notifications = await this.repository.find({
      where: {
        userId: member.userId,
        status: NotificationStatus.JUST_CREATED,
        workspaceId: member.workspaceId,
      },
      order: { createdAt: -1 },
    });

    const viewedIds = notifications.map((v) => v._id);
    await this.repository.updateMany(
      { _id: { $in: viewedIds } },
      { $set: { status: NotificationStatus.LIST_VIEWED } },
    );

    this.queueProducers.captureEvent({
      channel: EventChannel.PERSONAL,
      userId: member.userId,
      type: EventType.NOTIFICATION_LIST_VIEWED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: member.workspaceId,
    });

    return viewedIds;
  }

  async markAsReaded(member: WorkspaceMember, _id: string) {
    const notification = await this.get(_id);

    if (notification.userId !== member.userId) {
      throw new NotFoundException(AppMessage.ACCESS_DENIED);
    }

    notification.status = NotificationStatus.READED;

    await this.repository.update(notification._id, {
      status: NotificationStatus.READED,
    });

    this.queueProducers.captureEvent({
      channel: EventChannel.PERSONAL,
      userId: member.userId,
      ref: notification._id.toString(),
      type: EventType.NOTIFICATION_READED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: notification.workspaceId,
    });

    return notification;
  }

  async clean(member: WorkspaceMember) {
    const notifications = await this.list({
      member,
      query: { getAll: true },
    });

    await Promise.all(
      notifications.results.map((v) => this.repository.delete(v._id)),
    );

    this.queueProducers.captureEvent({
      channel: EventChannel.PERSONAL,
      type: EventType.NOTIFICATION_CLEANED,
      actionType: EventDataActionType.ARCHIVED,
      userId: member.userId,
      workspaceId: member.workspaceId,
    });
  }
}
