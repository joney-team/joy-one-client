import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppEntity } from '../app.types';
import { CustomersService } from '../customers/customers.service';
import { DatabaseName } from '../database/database.types';
import { withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { CustomerContactEntity } from './entities/customer-contact.entity';
import { SetCustomerContactsInput } from './customer-contacts.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class CustomerContactsService {
  constructor(
    @InjectRepository(CustomerContactEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<CustomerContactEntity>,
    private readonly customers: CustomersService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['customerId'],
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async set(
    args: WithWorkspaceArgs<{
      customerId: string;
      input: SetCustomerContactsInput;
      ignoreSave?: boolean;
    }>,
  ) {
    const { member, customerId, input, ignoreSave, workspaceId } =
      withWorkspaceArgs(args);

    const contact =
      (await this.repository.findOne({ where: { customerId: customerId } })) ||
      new CustomerContactEntity();

    const customer = await this.customers.get({ id: customerId, workspaceId });

    if (!contact._id) {
      contact._id = new ObjectId();
      contact.customerId = customer._id.toString();
      contact.workspaceId = customer.workspaceId;
    }

    contact.contacts = input.contacts;

    if (!ignoreSave) {
      await this.repository.save(contact);
      this.queueProducers.captureEvent({
        workspaceId: contact.workspaceId,
        type: EventType.CUSTOMER_CONTACTS_UPDATED,
        actionType: EventDataActionType.UPDATE,
        userId: member?.userId,
        ref: contact._id.toString(),
        persist: true,
        relatedEntities: [
          { entity: AppEntity.CUSTOMERS, id: contact.customerId },
        ],
      });
    }

    return contact;
  }

  async get(args: WithWorkspaceArgs<{ customerId: string }>) {
    const { customerId, workspaceId } = withWorkspaceArgs(args);
    const contact = await this.repository.findOne({ where: { customerId } });
    if (!contact) {
      return this.set({
        ignoreSave: true,
        customerId,
        workspaceId,
        input: { contacts: [] },
      });
    } else {
      return contact;
    }
  }
}
