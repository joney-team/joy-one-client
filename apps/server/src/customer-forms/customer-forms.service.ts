import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  validateWorkspaceAccessable,
  WithWorkspaceArgs,
  withWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { MongoRepository } from 'typeorm';
import { PayloadException } from '../app.exceptions';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CustomersService } from '../customers/customers.service';
import { DatabaseName } from '../database/database.types';
import {
  bindData,
  BulkUpdateWorkspaceBranchInput,
  mustBeObjectId,
  safeBindData,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import {
  migrateVnLocation,
  renderPrevVnLocation,
} from '../locations/locations.utils';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WithOptionalWorkspaceArgs } from '../workspaces/workspaces.utils';
import { CustomerFormInput } from './customer-forms.dtos';
import { CustomerFormEntity } from './customer-forms.entity';
import {
  CustomerFormEventData,
  CustomerFormStatus,
} from './customer-forms.types';

@Injectable()
export class CustomerFormsService {
  constructor(
    @InjectRepository(CustomerFormEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<CustomerFormEntity>,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceBranches: WorkspaceBranchesService,
    @Inject(forwardRef(() => CustomersService))
    private readonly customers: CustomersService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async bindData(entity: CustomerFormEntity) {
    return bindData<
      {
        workspaceBranch: WorkspaceBranchEntity | null;
      },
      CustomerFormEntity
    >({
      entity,
      extends: {
        workspaceBranch: safeBindData({
          entity,
          field: 'workspaceBranchId',
          fetch: (id) => this.workspaceBranches.get(id),
        }),
      },
    });
  }

  async bindEventData(data: CustomerFormEntity) {
    const { workspaceBranch } = await this.bindData(data);

    const eventData: CustomerFormEventData = {
      name: data.name,
      phone: data.phone,
      location: renderPrevVnLocation(data.location),
      email: data.email,
      workspaceBranchId: workspaceBranch?._id.toString(),
      workspaceBranchName: workspaceBranch?.name,
    };

    return eventData;
  }

  async create(input: CustomerFormInput) {
    const entity = new CustomerFormEntity();

    // Validate existed
    const existed = await this.repository.findOne({
      where: { phone: input.phone },
    });
    if (existed)
      throw new PayloadException({
        phone: AppMessage.CUSTOMER_PHONE_ALREADY_EXISTS,
      });

    const isCustomerExisted = await this.customers.isPhoneExisted({
      phone: input.phone,
      workspaceId: input.workspaceId,
    });
    if (isCustomerExisted) {
      throw new PayloadException({
        phone: AppMessage.CUSTOMER_PHONE_ALREADY_EXISTS,
      });
    }

    entity.name = input.name;
    entity.phone = input.phone;
    entity.email = input.email;
    entity.dynamicData = input.dynamicData;
    entity.workspaceBranchId = input.workspaceBranchId || null;
    entity.status = input.status || CustomerFormStatus.PENDING;
    entity.location = input.location || null;
    entity.vnLocation = input.vnLocation || null;

    const workspace = await this.workspaces.get(input.workspaceId);
    entity.workspaceId = workspace._id.toString();

    await this.repository.save(entity);

    this.queueProducers.captureEvent({
      ref: entity._id.toString(),
      actionType: EventDataActionType.CREATE,
      type: EventType.CUSTOMER_FORM_NEW,
      workspaceId: workspace._id.toString(),
      data: await this.bindEventData(entity),
      persist: true,
    });

    // Auto convert vn location if not provided
    if (entity.location && !entity.vnLocation) {
      await this.convertVnLocations({
        id: entity._id.toString(),
        workspaceId: workspace._id.toString(),
      });
    }

    return entity;
  }

  async get(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!data) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async update(
    args: WithWorkspaceArgs<{ id: string; input: CustomerFormInput }>,
  ) {
    const { input, id, member } = withWorkspaceArgs(args);
    const data = await this.get({ ...args, id: id });
    data.name = input.name;
    data.status = input.status || data.status;
    data.phone = input.phone;
    data.email = input.email;
    data.dynamicData = input.dynamicData;
    data.workspaceBranchId = input.workspaceBranchId || null;
    data.location = input.location || null;
    data.vnLocation = input.vnLocation || null;
    data.cancelReason = input.cancelReason || null;

    this.queueProducers.captureEvent({
      ref: data._id.toString(),
      actionType: EventDataActionType.UPDATE,
      type: EventType.CUSTOMER_FORM_UPDATED,
      userId: member?.userId,
      workspaceId: data.workspaceId,
      data: await this.bindEventData(data),
      persist: true,
    });

    return this.repository.save(data);
  }

  async list(args: WithOptionalWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['name', 'phone', 'email', 'status'],
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async bulkUpdateWorkspaceBranch(
    args: WithWorkspaceArgs<{
      input: BulkUpdateWorkspaceBranchInput;
    }>,
  ) {
    const { member } = withWorkspaceArgs(args);
    const { input } = args;

    const forms = await this.repository.find({
      where: {
        _id: { $in: input.ids.map((v) => mustBeObjectId(v)) },
      },
    });

    forms.map((v) => validateWorkspaceAccessable({ member, data: v }));

    await Promise.all(
      forms.map(async (v) => {
        v.workspaceBranchId = input.workspaceBranchId || null;
        await this.repository.save(v);
      }),
    );

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.UPDATE,
      type: EventType.CUSTOMER_FORM_UPDATED,
      userId: member.userId,
      workspaceId: member.workspaceId,
      data: { ids: input.ids },
      persist: true,
    });

    return forms;
  }

  async archive(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id } = withWorkspaceArgs(args);
    const data = await this.get(args);
    await this.repository.remove(data);

    if (member) {
      this.queueProducers.captureEvent({
        ref: data._id.toString(),
        actionType: EventDataActionType.ARCHIVED,
        type: EventType.CUSTOMER_FORM_ARCHIVED,
        userId: member.userId,
        workspaceId: data.workspaceId,
        data: { ids: [id] },
        persist: true,
      });
    }

    return data;
  }

  async bulkArchive(args: WithWorkspaceArgs<{ ids: string[] }>) {
    const { member, ids } = withWorkspaceArgs(args);
    const data = await this.repository.find({
      where: {
        _id: { $in: ids.map((v) => mustBeObjectId(v)) },
      },
    });

    data.map((v) => validateWorkspaceAccessable({ member, data: v }));

    await Promise.all(
      data.map(async (v) => {
        await this.repository.remove(v);
      }),
    );

    if (member) {
      this.queueProducers.captureEvent({
        actionType: EventDataActionType.ARCHIVED,
        type: EventType.CUSTOMER_FORM_ARCHIVED,
        userId: member.userId,
        workspaceId: member.workspaceId,
        data: { ids },
        persist: true,
      });
    }

    return data;
  }

  async convertVnLocations(args: WithWorkspaceArgs<{ id: string }>) {
    const form = await this.get(args);
    if (
      form.location &&
      form.location.provinceId &&
      form.location.districtId &&
      form.location.wardId
    ) {
      form.vnLocation = await migrateVnLocation(form.location).catch(() => ({
        address: form.location.address,
      }));
    } else if (form.location.address) {
      form.vnLocation = { address: form.location.address };
    }
    await this.repository.save(form);

    this.queueProducers.captureEvent({
      actionType: EventDataActionType.UPDATE,
      type: EventType.CUSTOMER_FORM_UPDATED,
      workspaceId: form.workspaceId,
      data: await this.bindEventData(form),
      ref: form._id.toString(),
      relatedEntities: [
        {
          entity: AppEntity.CUSTOMER_FORMS,
          id: form._id.toString(),
          index: true,
        },
      ],
    });
  }

  async bulkConvertVnLocations() {
    const forms = await this.repository.find({});

    for (const form of forms) {
      await this.convertVnLocations({
        id: form._id.toString(),
        workspaceId: form.workspaceId,
      });
    }
  }
}
