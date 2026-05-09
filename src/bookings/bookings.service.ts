import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomersService } from 'src/customers/customers.service';
import {
  bindData,
  detectWorkspaceBranchId,
  mustBeObjectId,
  safeBindData,
  withMongoQuery,
} from 'src/database/database.utils';
import { EventDataActionType, EventType } from 'src/events/events.types';
import { MongoRepository } from 'typeorm';
import { PayloadException } from '../app.exceptions';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { configs } from '../config/config';
import { CustomerShortInfo } from '../customers/customers.types';
import { DatabaseName } from '../database/database.types';
import { AppLocale } from '../lang/lang.types';
import { PluginZaloOasService } from '../plugin-zalo-oas/plugin-zalo-oas.service';
import { NotifyNewBookingToZaloGmfGroup } from '../queue-consumers/consumers/notify-new-booking-to-zalo-gmf-group.consumer';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ExportReportByRangeTimeInput } from '../reports/reports.types';
import { DateTime } from '../utils/date-time';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import {
  BookingEventData,
  BookingsMetricsReport,
  BookingStatus,
  BookingsTimeSeriesReport,
  CancelBookingArgs,
  CreateBookingArgs,
  RescheduleBookingArgs,
  UpdateBookingArgs,
} from './bookings.types';
import { BookingEntity } from './entities/booking.entity';
@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity, DatabaseName.MONGO)
    public repository: MongoRepository<BookingEntity>,
    private customers: CustomersService,
    private workspace: WorkspacesService,
    private pluginZaloOAs: PluginZaloOasService,
    private workspaceMembers: WorkspaceMembersService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(args: WithWorkspaceArgs<{ id: string }>) {
    const { id, member } = withWorkspaceArgs(args);
    const booking = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!booking) throw new NotFoundException(AppMessage.BOOKING_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data: booking });
    return booking;
  }

  async list(
    args: WithWorkspaceArgs<{ query?: any; select?: (keyof BookingEntity)[] }>,
  ) {
    const { select } = args;
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['customerId', 'status'],
        filterRangeFields: ['startTime', 'endTime'],
        filterTimeRangeFields: ['startTime', 'endTime'],
        sortFields: ['startTime'],
        select,
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async bindData(booking: BookingEntity) {
    return bindData<
      {
        customer: CustomerShortInfo;
        assigneeUsers: WorkspaceMember[];
      },
      BookingEntity
    >({
      entity: booking,
      extends: {
        customer: safeBindData({
          entity: booking,
          field: 'customerId',
          fetch: async (customerId) => {
            return this.customers.getShortInfo({
              id: customerId,
              workspaceId: booking.workspaceId,
            });
          },
        }),
        assigneeUsers: safeBindData({
          entity: booking,
          field: 'assigneeUserIds',
          fetch: async (assigneeUserIds, booking) => {
            return this.workspaceMembers.getByUserIds(
              assigneeUserIds,
              booking.workspaceId,
            );
          },
        }),
      },
    });
  }

  async bindEventData(booking: BookingEntity): Promise<BookingEventData> {
    const customer = booking.customerId
      ? await this.customers.getWithCache({
          id: booking.customerId,
          workspaceId: booking.workspaceId,
        })
      : null;

    return {
      bookingTitle: booking.title,
      bookingNote: booking.note,
      customerName: customer?.name,
      customerCode: customer?.code,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      dateTime: booking.startTime,
      rejectedReason: booking.reasonForCancellation,
      assigneeUserIds: booking.assigneeUserIds,
    };
  }

  async create(args: WithWorkspaceArgs<CreateBookingArgs>) {
    const { member, workspaceId } = withWorkspaceArgs(args);

    const booking = new BookingEntity();
    booking.title = args.title?.trim() ?? '';
    booking.note = args.note?.trim() ?? '';
    booking.startTime = args.startTime;
    booking.endTime = args.endTime;
    booking.status = args.status;
    booking.workspaceId = workspaceId;
    booking.workspaceBranchId = detectWorkspaceBranchId({
      doc: booking,
      dto: args,
      member,
    });

    booking.assigneeUserIds = args.assigneeUserIds ?? [];

    if (args.startTime >= args.endTime) {
      throw new BadRequestException(
        AppMessage.START_TIME_MUST_BE_LESS_THAN_END_TIME,
      );
    }

    if (args.customerId) {
      const customer = await this.customers.getShortInfo({
        id: args.customerId,
        workspaceId,
      });
      booking.customerId = customer._id?.toString();
    }

    const totalAssignee =
      booking.assigneeUserIds.length + (booking.customerId ? 1 : 0);

    if (totalAssignee < 1) {
      throw new PayloadException({
        assigneeUserIds: AppMessage.BOOKING_HAS_ENOUGH_ASSIGNEE,
        assigneeUsers: AppMessage.BOOKING_HAS_ENOUGH_ASSIGNEE,
      });
    }

    await this.repository.save(booking);
    await this.onCreated(member, booking);
    return booking;
  }

  async onCreated(member: WorkspaceMember, booking: BookingEntity) {
    const workspace = await this.workspace.get(booking.workspaceId);
    const settings = await this.workspace.getSettings(workspace._id);

    this.queueProducers.sendZaloOaZnsNewBooking({
      bookingId: booking._id.toString(),
      workspaceId: booking.workspaceId,
    });

    this.queueProducers.captureEvent({
      workspaceId: booking.workspaceId,
      userId: member?.userId,
      type: EventType.BOOKING_NEW,
      actionType: EventDataActionType.CREATE,
      ref: booking._id.toString(),
      time: booking.createdAt,
      data: await this.bindEventData(booking),
      persist: true,
      relatedEntities: [
        { entity: AppEntity.CUSTOMERS, id: booking.customerId },
        ...booking.assigneeUserIds.map((userId) => ({
          entity: AppEntity.USERS,
          id: userId,
        })),
      ],
    });

    if (
      settings.bookingsAutoRemindCustomerBookingBeforeDays &&
      settings.bookingsAutoRemindCustomerBookingBeforeDays > 0
    ) {
      const oneDay = 24 * 60 * 60 * 1000;
      const { end: remindTime } = DateTime.getRange(
        booking.startTime * 1000 -
          settings.bookingsAutoRemindCustomerBookingBeforeDays * oneDay,
        'day',
      );

      const isNeedToRemindNow = remindTime < new Date();
      if (isNeedToRemindNow) {
        // TODO: Send reminder to customer booking before day (ZNS)
      }
    }
  }

  async update(args: WithWorkspaceArgs<UpdateBookingArgs>) {
    const { member, id } = withWorkspaceArgs(args);
    const booking = await this.get({ ...args, id });

    if (member) {
      validateWorkspaceAccessable({ member, data: booking });
    }

    booking.note = args.note?.trim() ?? '';
    booking.title = args.title?.trim() ?? '';
    booking.assigneeUserIds = args.assigneeUserIds ?? [];
    booking.customerId = args.customerId ?? null;

    await this.repository.save(booking);

    this.queueProducers.captureEvent({
      workspaceId: booking.workspaceId,
      userId: member?.userId,
      type: EventType.BOOKING_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: booking._id.toString(),
      data: await this.bindEventData(booking),
      persist: true,
      relatedEntities: [
        { entity: AppEntity.CUSTOMERS, id: booking.customerId },
        ...booking.assigneeUserIds.map((userId) => ({
          entity: AppEntity.USERS,
          id: userId,
        })),
      ],
    });

    return booking;
  }

  async checkin(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const booking = await this.get(args);

    if (booking.workspaceId !== member.workspaceId) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    booking.status = BookingStatus.CHECK_IN;

    await this.repository.save(booking);

    this.queueProducers.captureEvent({
      workspaceId: booking.workspaceId,
      userId: member?.userId,
      type: EventType.BOOKING_CHECKIN,
      actionType: EventDataActionType.UPDATE,
      ref: booking._id.toString(),
      data: await this.bindEventData(booking),
      persist: true,
      relatedEntities: [
        { entity: AppEntity.CUSTOMERS, id: booking.customerId },
        ...booking.assigneeUserIds.map((userId) => ({
          entity: AppEntity.USERS,
          id: userId,
        })),
      ],
    });

    return booking;
  }

  async reschedule(args: WithWorkspaceArgs<RescheduleBookingArgs>) {
    const { prevBookingId } = args;

    const prevBooking = await this.get({ ...args, id: prevBookingId });

    const booking = await this.create({
      ...args,
    });

    prevBooking.status = BookingStatus.RESCHEDULED;
    prevBooking.transferToBookingId = booking._id.toString();

    await this.repository.save(prevBooking);
    return booking;
  }

  async cancel(args: WithWorkspaceArgs<CancelBookingArgs>) {
    const { member } = withWorkspaceArgs(args);
    const booking = await this.get(args);

    booking.status = BookingStatus.CANCELLED;
    booking.reasonForCancellation = args.reason;

    await this.repository.save(booking);

    this.queueProducers.captureEvent({
      workspaceId: booking.workspaceId,
      userId: member?.userId,
      type: EventType.BOOKING_CANCELLED,
      actionType: EventDataActionType.UPDATE,
      ref: booking._id.toString(),
      data: await this.bindEventData(booking),
      persist: true,
      relatedEntities: [
        { entity: AppEntity.CUSTOMERS, id: booking.customerId },
        ...booking.assigneeUserIds.map((userId) => ({
          entity: AppEntity.USERS,
          id: userId,
        })),
      ],
    });

    return booking;
  }

  async complete(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const booking = await this.get(args);

    booking.status = BookingStatus.COMPLETED;

    await this.repository.save(booking);

    this.queueProducers.captureEvent({
      workspaceId: booking.workspaceId,
      userId: member?.userId,
      type: EventType.BOOKING_COMPLETED,
      actionType: EventDataActionType.UPDATE,
      ref: booking._id.toString(),
      data: await this.bindEventData(booking),
      persist: true,
      relatedEntities: [
        { entity: AppEntity.CUSTOMERS, id: booking.customerId },
        ...booking.assigneeUserIds.map((userId) => ({
          entity: AppEntity.USERS,
          id: userId,
        })),
      ],
    });

    return booking;
  }

  async inProgress(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const booking = await this.get(args);

    booking.status = BookingStatus.IN_PROGRESS;

    await this.repository.save(booking);

    this.queueProducers.captureEvent({
      workspaceId: booking.workspaceId,
      userId: member?.userId,
      type: EventType.BOOKING_IN_PROGRESS,
      actionType: EventDataActionType.UPDATE,
      ref: booking._id.toString(),
      data: await this.bindEventData(booking),
      persist: true,
      relatedEntities: [
        { entity: AppEntity.CUSTOMERS, id: booking.customerId },
        ...booking.assigneeUserIds.map((userId) => ({
          entity: AppEntity.USERS,
          id: userId,
        })),
      ],
    });

    return booking;
  }

  async notifyNewBookingToGmfGroup(dto: NotifyNewBookingToZaloGmfGroup) {
    const booking = await this.get({
      id: dto.bookingId,
      workspaceId: dto.workspaceId,
    });

    const relatedData = await this.bindData(booking);

    if (relatedData.customer && relatedData.customer.name) {
      await this.pluginZaloOAs.sendGmfGroupMessage({
        workspaceId: booking.workspaceId,
        message: `🗓️ Lịch hẹn mới: ${relatedData.customer.name}
SĐT khách hàng: ${relatedData.customer.phone || '--'}
Thời gian: ${DateTime.format(booking.startTime, { locale: AppLocale.vi })}
Chi tiết: ${configs.APP_URL}/customers/${relatedData.customer.code}`,
      });
    }
  }

  async timeSeriesReport(
    input: ExportReportByRangeTimeInput,
  ): Promise<BookingsTimeSeriesReport> {
    let where = {
      workspaceId: input.workspaceId,
      startTime: {
        $gte: input.fromTime,
        $lt: input.toTime,
      },
      isArchived: { $ne: true },
    };

    if (input.userId) {
      where['assigneeUserIds'] = { $in: [input.userId] };
    }

    if (input.workspaceBranchIds) {
      where['workspaceBranchId'] = { $in: input.workspaceBranchIds };
    }

    const bookings = await this.repository.find({ where });

    return {
      total: bookings.length,
      completed: bookings.filter((v) => v.status === BookingStatus.COMPLETED)
        .length,
      canceled: bookings.filter((v) => v.status === BookingStatus.CANCELLED)
        .length,
      transferred: bookings.filter(
        (v) => v.status === BookingStatus.RESCHEDULED,
      ).length,
      inProgress: bookings.filter((v) => v.status === BookingStatus.IN_PROGRESS)
        .length,
    };
  }

  async metricsReport(member: WorkspaceMember): Promise<BookingsMetricsReport> {
    const dayRange = DateTime.getRange(new Date(), 'day');

    const list = await this.list({
      member,
      query: {
        rangeStartTime: `${DateTime.toSeconds(dayRange.start)}-${DateTime.toSeconds(dayRange.end)}`,
        status: [
          BookingStatus.JUST_CREATED,
          BookingStatus.CHECK_IN,
          BookingStatus.IN_PROGRESS,
        ],
        getAll: true,
      },
    });

    const userBookingsCount = list.results.filter((v) =>
      v.assigneeUserIds.includes(member.userId),
    ).length;

    return {
      todayCount: list.total,
      userBookingsCount,
    };
  }
}
