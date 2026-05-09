import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CustomersService } from '../customers/customers.service';
import { DatabaseName } from '../database/database.types';
import { withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { migrateVnLocation } from '../locations/locations.utils';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { CustomerKycEntity } from './customer-kycs.entity';
import {
  CustomerKycInput,
  CustomerKycStatus,
  RejectCustomerKycInput,
} from './customer-kycs.types';

@Injectable()
export class CustomerKycsService {
  constructor(
    @InjectRepository(CustomerKycEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<CustomerKycEntity>,
    private readonly customers: CustomersService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    let order: any = { updatedAt: -1 };

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        order,
        filterFields: ['customerId', 'status'],
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async bindData(kyc: CustomerKycEntity) {
    const [customer] = await Promise.all([
      this.customers.getWithCache({
        id: kyc.customerId,
        workspaceId: kyc.workspaceId,
      }),
    ]);

    return {
      ...kyc,
      customer,
    } as any;
  }

  async bindEventData(kyc: CustomerKycEntity) {
    const customer = await this.customers.getWithCache({
      id: kyc.customerId,
      workspaceId: kyc.workspaceId,
    });

    return {
      version: kyc.versions[kyc.versions.length - 1],
      customerName: customer.name,
      customerId: customer._id.toString(),
      customerPhone: customer.phone,
      customerCode: customer.code,
    };
  }

  async register(
    args: WithWorkspaceArgs<{ customerId: string; input: CustomerKycInput }>,
  ) {
    const { customerId, input, workspaceId } = withWorkspaceArgs(args);
    const existed = await this.repository.findOne({
      where: { customerId: customerId },
    });

    if (existed && existed.status === CustomerKycStatus.PENDING) {
      throw new BadRequestException(AppMessage.CUSTOMER_KYC_WAS_REGISTERED);
    }

    if (existed && existed.status === CustomerKycStatus.APPROVED) {
      throw new BadRequestException(AppMessage.CUSTOMER_KYC_WAS_APPROVED);
    }

    const customer = await this.customers.get({ id: customerId, workspaceId });

    const kyc = existed || new CustomerKycEntity();
    kyc.customerId = customer._id.toString();
    kyc.workspaceId = customer.workspaceId;
    kyc.status = CustomerKycStatus.PENDING;

    kyc.versions = [
      ...(kyc.versions ?? []),
      {
        id: uuid(),
        cidBirthday: input.cidBirthday,
        cidCreatedAt: input.cidCreatedAt,
        cidFullName: input.cidFullName,
        cidGender: input.cidGender,
        cidLocation: input.cidLocation,
        cidVnLocation: input.cidVnLocation,
        cidNumber: input.cidNumber,
        cidRaw: input.cidRaw,
        frontOfCidImage: input.frontOfCidImage,
        backOfCidImage: input.backOfCidImage,
        portraitImage: input.portraitImage,
        createdAt: DateTime.getNowInSeconds(),
        status: CustomerKycStatus.PENDING,
      },
    ];

    kyc.cidNumber = kyc.versions[kyc.versions.length - 1].cidNumber;

    if (!customer.avatar) {
      await this.customers.setAvatar(
        customer,
        kyc.versions[kyc.versions.length - 1].portraitImage,
      );
    }

    await this.repository.save(kyc);

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_KYC_PENDING,
      actionType: EventDataActionType.CREATE,
      workspaceId: kyc.workspaceId,
      ref: kyc._id.toString(),
      data: await this.bindEventData(kyc),
      persist: true,
      relatedEntities: [{ entity: AppEntity.CUSTOMERS, id: kyc.customerId }],
    });

    // Convert vn location if not provided
    if (!input.cidVnLocation) {
      await this.convertVnLocations(customerId);
    }

    return kyc;
  }

  async get(customerId: string) {
    const kyc = await this.repository.findOne({ where: { customerId } });
    if (!kyc) throw new NotFoundException(AppMessage.DATA_NOT_FOUND);
    return kyc;
  }

  async approve(args: WithWorkspaceArgs<{ customerId: string }>) {
    const { customerId, member } = withWorkspaceArgs(args);
    const kyc = await this.get(customerId);

    kyc.versions[kyc.versions.length - 1].status = CustomerKycStatus.APPROVED;
    kyc.status = CustomerKycStatus.APPROVED;
    kyc.cidNumber = kyc.versions[kyc.versions.length - 1].cidNumber;

    await this.repository.save(kyc);

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_KYC_APPROVED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      workspaceId: kyc.workspaceId,
      ref: kyc._id.toString(),
      data: await this.bindEventData(kyc),
      persist: true,
      relatedEntities: [{ entity: AppEntity.CUSTOMERS, id: kyc.customerId }],
    });

    return kyc;
  }

  async reject(
    args: WithWorkspaceArgs<{
      customerId: string;
      input: RejectCustomerKycInput;
    }>,
  ) {
    const { customerId, input, member } = withWorkspaceArgs(args);
    const kyc = await this.get(customerId);

    kyc.versions[kyc.versions.length - 1].status = CustomerKycStatus.REJECTED;
    kyc.versions[kyc.versions.length - 1].rejectReason = input.reason;
    kyc.status = CustomerKycStatus.REJECTED;

    await this.repository.save(kyc);

    this.queueProducers.captureEvent({
      type: EventType.CUSTOMER_KYC_REJECTED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      workspaceId: kyc.workspaceId,
      ref: kyc._id.toString(),
      data: await this.bindEventData(kyc),
      persist: true,
      relatedEntities: [{ entity: AppEntity.CUSTOMERS, id: kyc.customerId }],
    });

    return kyc;
  }

  async convertVnLocations(id: string) {
    const kyc = await this.get(id);

    kyc.versions = await Promise.all(
      kyc.versions.map(async (version) => {
        let _version = { ...version };

        if (
          version.cidLocation &&
          version.cidLocation.provinceId &&
          version.cidLocation.districtId &&
          version.cidLocation.wardId
        ) {
          _version.cidVnLocation = await migrateVnLocation(
            version.cidLocation,
          ).catch(() => ({ address: version.cidLocation.address }));
        } else if (version.cidLocation?.address) {
          _version.cidVnLocation = { address: version.cidLocation.address };
        }

        return _version;
      }),
    );

    await this.repository.save(kyc);
  }

  async bulkConvertVnLocations() {
    const kycs = await this.repository.find({ order: { createdAt: -1 } });

    for (const kyc of kycs) {
      await this.convertVnLocations(kyc.customerId);
      logger.info(`Customer KYC Location converted ${kyc.customerId}`);
    }
  }
}
