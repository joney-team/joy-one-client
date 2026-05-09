import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PayloadException } from 'src/app.exceptions';
import { logger, onError } from 'src/app.logger';
import { CacheService } from 'src/cache/cache.service';
import {
  bindData,
  BulkUpdateWorkspaceBranchInput,
  detectWorkspaceBranchId,
  mustBeObjectId,
  safeBindData,
  withMongoQuery,
} from 'src/database/database.utils';
import {
  EventDataActionType,
  EventType,
  EventVariant,
} from 'src/events/events.types';
import { WorkspaceEntity } from 'src/workspaces/entities/workspace.entity';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity, PageMetadata, EntitySource, Period } from '../app.types';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import {
  renderPrevVnLocation,
  renderVnLocation,
} from '../locations/locations.utils';
import { PluginZaloOasService } from '../plugin-zalo-oas/plugin-zalo-oas.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ExportReportByRangeTimeInput } from '../reports/reports.types';
import { getReportTimeRange } from '../reports/reports.utils';
import { DateTime } from '../utils/date-time';
import { validatePhoneNumber } from '../utils/phone.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  type WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import {
  AssignCustomerInput,
  CustomerAuthInput,
  CustomerAuthWithZaloInput,
  CustomerDeviceDto,
  CustomerInput,
} from './customers.inputs';
import { CustomerEntity } from './customers.entity';
import { CustomerTokens } from './customers.tokens';
import {
  CustomerEventData,
  CustomerShortInfo,
  CustomersMetricsReport,
  CustomersTimeSeriesReport,
  NotifyNewCustomerToZaloGmfGroup,
} from './customers.types';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity, DatabaseName.MONGO)
    public repository: MongoRepository<CustomerEntity>,
    private cache: CacheService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private workspaceMembers: WorkspaceMembersService,
    @Inject(forwardRef(() => WorkspaceBranchesService))
    private workspaceBranches: WorkspaceBranchesService,
    private readonly queueProducers: QueueProducersService,
    @Inject(forwardRef(() => PluginZaloOasService))
    private readonly pluginZaloOas: PluginZaloOasService,
  ) {}

  async getNextCode(workspace: WorkspaceEntity, addon = 0) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const prefix = `${year}${month}`;

    const count = await this.repository.findAndCount({
      where: { workspaceId: workspace._id.toString(), codePrefix: prefix },
      order: { createdAt: -1 },
      take: 0,
    });

    return {
      code: `${workspace.code}${prefix}${count[1] + 1 + addon}`,
      prefix,
    };
  }

  async save(args: WithWorkspaceArgs<{ customer: CustomerEntity }>) {
    const { workspace } = withWorkspaceArgs(args);
    const action = async (retry: number) => {
      try {
        const { code, prefix } = await this.getNextCode(workspace, retry);
        args.customer.code = code;
        args.customer.codePrefix = prefix;
        await this.repository.save(args.customer);
        return args.customer;
      } catch (error) {
        if (retry < 1000) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          await action(retry + 1);
        } else {
          console.error(error);
          throw new BadRequestException(AppMessage.DATA_CANNOT_BY_CREATED_YET);
        }
      }
    };

    return action(0);
  }

  async bindData(customer: CustomerEntity) {
    return bindData<
      {
        assigneeUsers: WorkspaceMemberPublicInfo[];
        relatedCustomers: CustomerEntity[];
        workspaceBranch: WorkspaceBranchEntity | null;

        vnLocationFullAddress: string;
        vnSecondaryLocationFullAddress: string;

        vnPrevLocationFullAddress: string;
        vnPrevSecondaryLocationFullAddress: string;
      },
      CustomerEntity
    >({
      entity: customer,
      extends: {
        vnPrevLocationFullAddress: (data) =>
          renderPrevVnLocation(data.location),
        vnPrevSecondaryLocationFullAddress: (data) =>
          renderPrevVnLocation(data.secondaryLocation),
        vnLocationFullAddress: (data) => renderVnLocation(data.vnLocation),
        vnSecondaryLocationFullAddress: (data) =>
          renderVnLocation(data.vnSecondaryLocation),
        assigneeUsers: async (data) =>
          this.workspaceMembers.getInfoByUserIds({
            userIds: data.assigneeUserIds,
            workspaceId: data.workspaceId,
          }),
        relatedCustomers: async (data) =>
          Promise.all(
            (data.relatedCustomerIds || [])
              .map((v) =>
                this.getWithCache({
                  id: v,
                  workspaceId: data.workspaceId,
                }).catch(
                  onError(
                    'CustomersService.bindData > customer.relatedCustomerIds > getWithCache',
                  ),
                ),
              )
              .filter((v) => v !== null),
          ),
        workspaceBranch: safeBindData({
          entity: customer,
          field: 'workspaceBranchId',
          fetch: async (fieldValue) => {
            if (!fieldValue) return null;
            return this.workspaceBranches.getWithCache({
              _id: fieldValue,
              workspaceId: customer.workspaceId,
            });
          },
        }),
      },
    });
  }

  async getMetadata(code: string): Promise<PageMetadata> {
    const { name } = await this.repository.findOne({ where: { code } });
    return {
      title: name,
    };
  }

  async getByCode(args: WithWorkspaceArgs<{ code: string }>) {
    const { member, code } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({ where: { code } });
    if (!data) throw new NotFoundException(AppMessage.CUSTOMER_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async getWithCacheByCode(args: WithWorkspaceArgs<{ code: string }>) {
    const { code, workspaceId } = withWorkspaceArgs(args);

    const instance = this.cache.instance({
      instanceKey: `customers:${workspaceId}`,
      fallback: () =>
        this.getByCode(args).then((result) => this.bindData(result)),
    });

    return instance.get(code);
  }

  async get(args: WithOptionalWorkspaceArgs<{ id: string }>) {
    const { member, id } = withOptionalWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException(AppMessage.CUSTOMER_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async getWithCache(args: WithWorkspaceArgs<{ id: string }>) {
    const { workspaceId, id: _id } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: `customers:${workspaceId}`,
      fallback: () => this.get(args).then((result) => this.bindData(result)),
    });
    return instance.get(_id);
  }

  async clearCache(args: WithWorkspaceArgs<{ id: string }>) {
    const { workspaceId } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: `customers:${workspaceId}`,
    });

    const customer = await this.get(args);
    await instance.clear(customer._id.toString());
    await instance.clear(customer.code);
  }

  bindEventData(customer: CustomerEntity): CustomerEventData {
    return {
      code: customer.code,
      name: customer.name,
      assigneeUserIds: customer.assigneeUserIds,
    };
  }

  async isPhoneExisted(args: WithWorkspaceArgs<{ phone: string }>) {
    const { workspaceId } = withWorkspaceArgs(args);
    const isExistedPhone = await this.repository.findOne({
      where: { phone: args.phone, workspaceId },
      select: ['_id'],
    });
    return !!isExistedPhone;
  }

  async getByIds(ids: string[], select?: (keyof CustomerEntity)[]) {
    return this.repository.find({
      where: { _id: { $in: ids.map(mustBeObjectId) } },
      select,
    });
  }

  async create(args: WithWorkspaceArgs<{ input: CustomerInput }>) {
    const customer = new CustomerEntity();
    const now = DateTime.getNowInSeconds();
    const { member, workspace, input } = withWorkspaceArgs(args);

    if (input.phone) {
      const isExistedPhone = await this.isPhoneExisted({
        phone: input.phone,
        workspace,
      });

      if (isExistedPhone) {
        throw new PayloadException({
          phone: AppMessage.CUSTOMER_PHONE_ALREADY_EXISTS,
        });
      }

      const validPhone = validatePhoneNumber(input.phone, false);
      if (!validPhone) {
        throw new PayloadException({ phone: AppMessage.INVALID_PHONE_NUMBER });
      }

      customer.phone = validPhone;
    }

    if (input.email) {
      const isExistedEmail = await this.repository.findOne({
        where: { email: input.email, workspace },
      });
      if (isExistedEmail)
        throw new PayloadException({
          email: AppMessage.CUSTOMER_EMAIL_ALREADY_EXISTS,
        });
    }

    if (input.birthday) {
      const birthday = DateTime.normalizeDate(input.birthday);
      customer.birthday = input.birthday;
      customer.birthdayDate = birthday.getDate();
      customer.birthdayMonth = birthday.getMonth();
    }

    customer.name = input.name;
    customer.avatar = input.avatar;
    customer.email = input.email?.trim().toLowerCase();
    customer.location =
      input.location && Object.keys(input.location).length > 0
        ? input.location
        : undefined;
    customer.secondaryLocation =
      input.secondaryLocation && Object.keys(input.secondaryLocation).length > 0
        ? input.secondaryLocation
        : undefined;

    customer.vnLocation = input.vnLocation;
    customer.vnSecondaryLocation = input.secondaryLocation;

    customer.gender = input.gender;
    customer.presenterCustomerId = input.presenterCustomerId;
    customer.medicalHistory = input.medicalHistory || [];
    customer.workspaceId = workspace._id.toString();
    customer.assigneeUserIds = input.assigneeUserIds || [];
    customer.tagIds = input.tagIds || [];

    customer.lastCheckin = now;
    customer.createdAt = input.createdAt ?? now;
    customer.plainCode = input.plainCode ?? '';
    customer.salaryAmount = input.salaryAmount;
    customer.relatedCustomerIds = input.relatedCustomerIds || [];
    customer.relationshipContacts = (input.relationshipContacts || [])
      .filter((v) => !!v.name && !!v.phone)
      .map((v) => ({
        name: v.name.trim(),
        phone: v.phone.trim(),
        type: v.type?.trim(),
      }));

    customer.socialFacebookUrl = input.socialFacebookUrl;
    customer.createdByUserId = member?.userId;
    customer.source = input.source;

    customer.workspaceId = workspace._id.toString();
    customer.workspaceBranchId = detectWorkspaceBranchId({
      doc: customer,
      dto: input,
      ...args,
    });

    if (customer._id) {
      customer.relatedCustomerIds = customer.relatedCustomerIds.filter(
        (v) => v !== customer._id.toString(),
      );
    }

    await this.save({ customer, workspace });

    this.queueProducers.captureEvent({
      workspaceId: workspace._id.toString(),
      type: EventType.CUSTOMER_NEW,
      actionType: EventDataActionType.CREATE,
      userId: member?.userId,
      ref: customer._id.toString(),
      time: customer.createdAt,
      data: this.bindEventData(customer),
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.CUSTOMERS,
          id: customer._id.toString(),
          index: true,
        },
      ],
      reportTimeRange: getReportTimeRange(customer.createdAt),
    });

    return customer;
  }

  async update(args: WithWorkspaceArgs<{ id: string; input: CustomerInput }>) {
    const member = 'member' in args ? args.member : null;
    const { input } = args;

    const customer = await this.get(args);
    if (member && member.workspaceId !== customer.workspaceId) {
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    }

    customer.name = input.name;
    customer.avatar = input.avatar;
    customer.email = input.email?.trim().toLowerCase();
    customer.phone = input.phone;
    customer.location =
      Object.keys(input.location || {}).length > 0 ? input.location : undefined;
    customer.secondaryLocation =
      Object.keys(input.secondaryLocation || {}).length > 0
        ? input.secondaryLocation
        : undefined;

    customer.vnLocation = input.vnLocation;
    customer.vnSecondaryLocation = input.secondaryLocation;

    customer.medicalHistory = input.medicalHistory || [];
    customer.gender = input.gender;
    customer.presenterCustomerId = input.presenterCustomerId;
    customer.tagIds = input.tagIds || [];
    customer.plainCode = input.plainCode || '';
    customer.salaryAmount = input.salaryAmount;
    customer.relatedCustomerIds = input.relatedCustomerIds || [];
    customer.socialFacebookUrl = input.socialFacebookUrl;
    customer.relationshipContacts = (input.relationshipContacts || [])
      .filter((v) => !!v.name && !!v.phone)
      .map((v) => ({
        name: v.name.trim(),
        phone: v.phone.trim(),
        type: v.type?.trim(),
      }));

    if (input.birthday) {
      const birthday = DateTime.normalizeDate(input.birthday);
      customer.birthday = input.birthday;
      customer.birthdayDate = birthday.getDate();
      customer.birthdayMonth = birthday.getMonth();
    }

    if (input.phone) {
      const validPhone = validatePhoneNumber(input.phone, false);
      if (!validPhone) {
        throw new PayloadException({ phone: AppMessage.INVALID_PHONE_NUMBER });
      }

      customer.phone = validPhone;
    }

    await this.repository.save(customer);
    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      ref: customer._id.toString(),
      workspaceId: customer.workspaceId,
      data: this.bindEventData(customer),
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.CUSTOMERS,
          id: customer._id.toString(),
          index: true,
        },
      ],
    });

    return customer;
  }

  async assign(
    args: WithWorkspaceArgs<{ id: string; input: AssignCustomerInput }>,
  ) {
    const { member, input } = withWorkspaceArgs(args);
    const customer = await this.get(args);
    if (member) validateWorkspaceAccessable({ member, data: customer });

    const assignUserIds = input.userIds.filter(
      (v) => !customer.assigneeUserIds.includes(v),
    );
    const unAssignUserIds = customer.assigneeUserIds.filter(
      (v) => !input.userIds.includes(v),
    );

    // Validate users
    customer.assigneeUserIds = input.userIds;
    await this.repository.save(customer);
    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });

    if (assignUserIds.length > 0) {
      this.queueProducers.captureEvent({
        type: EventType.CUSTOMER_ASSIGN_TO_USER,
        actionType: EventDataActionType.UPDATE,
        userId: member?.userId,
        workspaceId: customer.workspaceId,
        ref: customer._id.toString(),
        persist: true,
        relatedEntities: [
          { entity: AppEntity.CUSTOMERS, id: customer._id.toString() },
          ...assignUserIds.map((userId) => ({
            entity: AppEntity.USERS,
            id: userId,
          })),
        ],
        data: this.bindEventData(customer),
      });
    }

    if (unAssignUserIds.length > 0) {
      this.queueProducers.captureEvent({
        type: EventType.CUSTOMER_UNASSIGN_USER,
        actionType: EventDataActionType.UPDATE,
        userId: member?.userId,
        workspaceId: customer.workspaceId,
        ref: customer._id.toString(),
        persist: true,
        relatedEntities: [
          { entity: AppEntity.CUSTOMERS, id: customer._id.toString() },
          ...unAssignUserIds.map((userId) => ({
            entity: AppEntity.USERS,
            id: userId,
          })),
        ],
        data: this.bindEventData(customer),
      });
    }

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      workspaceId: customer.workspaceId,
      ref: customer._id.toString(),
      relatedEntities: [
        {
          entity: AppEntity.CUSTOMERS,
          id: customer._id.toString(),
          index: true,
        },
      ],
      data: this.bindEventData(customer),
    });

    return customer;
  }

  async list(
    args: WithWorkspaceArgs<{ query?: any; select?: (keyof CustomerEntity)[] }>,
  ) {
    const { select } = withWorkspaceArgs(args);

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: [
          'gender',
          'birthdayDate',
          'birthdayMonth',
          'presenterCustomerId',
          'relatedCustomerIds',
          'tagIds',
          'salaryAmount',
          'socialFacebookUrl',
          'plainCode',
          'phone',
          'email',
          'code',
        ],
        select,
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async lastCheckin(args: WithWorkspaceArgs<{ id: string }>) {
    const { id: _id } = withWorkspaceArgs(args);
    try {
      const data = await this.get(args);
      data.lastCheckin = DateTime.getNowInSeconds();
      await this.repository.save(data);
      await this.clearCache({ id: _id, workspaceId: data.workspaceId });
    } catch (error) {
      logger.error(error, {
        fields: { CustomerId: _id },
        case: `Failed to update last checkin`,
      });
    }
  }

  async setAvatar(customer: CustomerEntity, avatar: string) {
    await this.repository.update(customer._id, {
      avatar,
    });

    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: customer.workspaceId,
      ref: customer._id.toString(),
      relatedEntities: [
        {
          entity: AppEntity.CUSTOMERS,
          id: customer._id.toString(),
          index: true,
        },
      ],
      data: this.bindEventData(customer),
    });
  }

  async archive(args: WithWorkspaceArgs<{ id: string }>, persist = true) {
    const { member } = withWorkspaceArgs(args);
    const customer = await this.get(args);

    customer.isArchived = true;

    await this.repository.update(customer._id, { isArchived: true });
    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      userId: member.userId,
      workspaceId: member.workspaceId,
      ref: customer._id.toString(),
      persist,
      variant: EventVariant.NEGATIVE,
      data: this.bindEventData(customer),
      relatedEntities: [
        {
          entity: AppEntity.CUSTOMERS,
          id: customer._id.toString(),
          index: true,
        },
      ],
      reportTimeRange: getReportTimeRange(customer.createdAt),
    });

    return customer;
  }

  async addDevice(
    args: WithWorkspaceArgs<{ id: string; dto: CustomerDeviceDto }>,
  ) {
    const { dto } = withWorkspaceArgs(args);
    const customer = await this.get(args);
    if (customer.deviceIds.includes(dto.deviceId)) return customer;
    customer.deviceIds.push(dto.deviceId);
    await this.repository.save(customer);
    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });
    return customer;
  }

  async removeDevice(
    args: WithWorkspaceArgs<{ id: string; dto: CustomerDeviceDto }>,
  ) {
    const { dto } = withWorkspaceArgs(args);
    const customer = await this.get(args);
    if (!customer.deviceIds.includes(dto.deviceId)) return customer;

    customer.deviceIds = customer.deviceIds.filter((v) => v !== dto.deviceId);

    await this.repository.save(customer);

    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });

    return customer;
  }

  async removeAllDevices(args: WithWorkspaceArgs<{ id: string }>) {
    const customer = await this.get(args);
    customer.deviceIds = [];
    await this.repository.save(customer);
    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });
    return customer;
  }

  async updateLastInteractionAt(args: WithWorkspaceArgs<{ id: string }>) {
    try {
      const customer = await this.get(args);
      await this.repository.update(customer._id, {
        lastInteractionAt: DateTime.getNowInSeconds(),
      });
      await this.clearCache({
        id: customer._id.toString(),
        workspaceId: customer.workspaceId,
      });
    } catch (error) {
      logger.error(error, {
        fields: { CustomerId: args.id },
        case: `Failed to update last interaction at`,
      });
    }
  }

  async timeSeriesReport(
    input: ExportReportByRangeTimeInput,
  ): Promise<CustomersTimeSeriesReport> {
    let baseQuery = {
      rangeCreatedAt: `${input.fromTime}-${input.toTime}`,
      workspaceBranchIds: input.workspaceBranchIds,
      getAll: true,
    };

    if (input.userId) {
      baseQuery['createdByUserId'] = input.userId;
    }

    const customers = await this.list({
      workspaceId: input.workspaceId,
      query: baseQuery,
    });

    return {
      total: customers.total,
      newIds: customers.results.map((v) => v._id.toString()),
    };
  }

  async getShortInfo(
    args: WithWorkspaceArgs<{ id: string }>,
  ): Promise<CustomerShortInfo> {
    const customer = await this.get(args);
    return {
      _id: customer._id.toString(),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      gender: customer.gender,
      avatar: customer.avatar,
      code: customer.code,
      tagIds: customer.tagIds,
      plainCode: customer.plainCode,
      createdAt: customer.createdAt,
      workspaceId: customer.workspaceId,
      workspaceBranchId: customer.workspaceBranchId,
    };
  }

  async metricsReport(
    member: WorkspaceMember,
  ): Promise<CustomersMetricsReport> {
    // Get new customers today
    const customers = await this.list({
      member,
      query: {
        timeRangeCreatedAt: `${Period.DATE}-${DateTime.getNowInSeconds()}`,
      },
    });

    return {
      newCustomersToday: customers.total,
    };
  }

  async authSignInWithZaloOa(
    args: WithWorkspaceArgs<{ input: CustomerAuthWithZaloInput }>,
  ) {
    const { workspaceId, input } = withWorkspaceArgs(args);

    const phone = await this.pluginZaloOas.getAccountPhoneFromToken({
      workspaceId,
      token: input.token,
      accessToken: input.accessToken,
    });

    if (!phone) throw new BadRequestException(AppMessage.MISSING_ZALO_OA_INFO);

    let customer = await this.repository.findOne({
      where: { phone, workspaceId },
    });

    if (customer) {
      if (!customer.name && input.name) customer.name = input.name;
      if (!customer.avatar && input.avatar) customer.avatar = input.avatar;
    } else {
      customer = await this.create({
        ...args,
        input: {
          name: input.name,
          avatar: input.avatar,
          phone,
          source: EntitySource.ZALO_OA,
          medicalHistory: [],
        },
      });
    }

    const tokens = await CustomerTokens.create(customer);

    await this.repository.save(customer);
    await this.clearCache({
      id: customer._id.toString(),
      workspaceId: customer.workspaceId,
    });

    return {
      ...customer,
      ...tokens,
    } as CustomerEntity & { accessToken: string; refreshToken: string };
  }

  async auth(input: CustomerAuthInput) {
    const tokenData = await CustomerTokens.verifyAccessToken(input.accessToken);
    const customer = await this.get({ id: tokenData._id });
    return this.bindData(customer);
  }

  async authRefreshToken(refreshToken: string) {
    const tokenData = await CustomerTokens.verifyRefreshToken(refreshToken);
    const customer = await this.get({ id: tokenData._id });
    const { accessToken } = await CustomerTokens.create(customer);
    return { accessToken };
  }

  async bulkUpdateWorkspaceBranch(
    args: WithWorkspaceArgs<{
      input: BulkUpdateWorkspaceBranchInput;
    }>,
  ) {
    const { member } = withWorkspaceArgs(args);
    const { input } = args;
    const { ids, workspaceBranchId } = input;

    const customers = await this.getByIds(ids);

    await Promise.all(
      customers.map(async (customer) => {
        customer.workspaceBranchId = workspaceBranchId || null;
        await this.repository.save(customer);
        await this.clearCache({
          id: customer._id.toString(),
          workspaceId: customer.workspaceId,
        });
        return customer;
      }),
    );

    if (member) {
      this.queueProducers.captureEvent({
        type: EventType.CUSTOMER_BULK_UPDATE_WORKSPACE_BRANCH,
        actionType: EventDataActionType.UPDATE,
        userId: member.userId,
        workspaceId: member.workspaceId,
        persist: true,
        data: { ids, customerIds: ids, workspaceBranchId },
        relatedEntities: customers.map((v) => ({
          entity: AppEntity.CUSTOMERS,
          id: v._id.toString(),
          index: true,
        })),
      });
    }

    return ids;
  }

  async notifyNewCustomerToZaloGmfGroup(dto: NotifyNewCustomerToZaloGmfGroup) {
    const customer = await this.get({
      id: dto.customerId,
      workspaceId: dto.workspaceId,
    });

    await this.pluginZaloOas.sendGmfGroupMessage({
      workspaceId: customer.workspaceId,
      message: `👤 Khách hàng mới: ${customer.name}
SĐT: ${customer.phone || '--'}
Chi tiết: ${configs.APP_URL}/customers/${customer.code}
`,
    });
  }
}
