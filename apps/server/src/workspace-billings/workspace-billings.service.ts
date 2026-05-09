import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { UsersService } from '../users/users.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  encodeWorkspace,
  WithOptionalWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { WorkspaceBillingEntity } from './entities/workspace-billing.entity';
import {
  WorkspaceBalance,
  WorkspaceBillingCashbackDto,
  WorkspaceBillingDepositDto,
  WorkspaceBillingPaymentDto,
  WorkspaceBillingStatus,
  WorkspaceBillingType,
} from './workspace-billings.types';

@Injectable()
export class WorkspaceBillingsService {
  constructor(
    @InjectRepository(WorkspaceBillingEntity, DatabaseName.MONGO)
    private repository: MongoRepository<WorkspaceBillingEntity>,
    private users: UsersService,
    @Inject(forwardRef(() => WorkspacesService))
    private workspaces: WorkspacesService,
    private queueProducers: QueueProducersService,
  ) {}

  async getNextCode(workspace: WorkspaceEntity) {
    const count = await this.repository.findAndCount({
      where: { workspaceId: workspace._id.toString() },
      order: { createdAt: -1 },
      take: 0,
    });

    return encodeWorkspace({
      workspaceCode: workspace.code,
      code: `${count[1] + 1}`,
      entity: AppEntity.BILLINGS,
    });
  }

  async save(data: WorkspaceBillingEntity, ws: WorkspaceEntity) {
    let retryTime = 0;
    let code = '';

    const action = async () => {
      try {
        code = await this.getNextCode(ws);
        data.code = code;

        const prevBilling = await this.repository.findOne({
          where: {
            workspaceId: data.workspaceId,
            status: WorkspaceBillingStatus.PAID,
          },
          order: { code: -1 },
        });

        const prevBalance = prevBilling ? prevBilling.balance : 0;
        data.balance =
          data.status === WorkspaceBillingStatus.PAID
            ? prevBalance + data.amount
            : prevBalance;

        const result = await this.repository.save(data);
        return result;
      } catch (error) {
        if (retryTime < 15) {
          retryTime++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await action();
        } else {
          throw new BadRequestException(AppMessage.DATA_CANNOT_BY_CREATED_YET);
        }
      }
    };

    return action();
  }

  async bindData(
    billing: WorkspaceBillingEntity,
    args?: { getWorkspace?: boolean },
  ) {
    const [workspace, createdByUser, manualSettlementByUser] =
      await Promise.all([
        args?.getWorkspace
          ? this.workspaces.get(billing.workspaceId).catch(() => undefined)
          : undefined,
        billing.createdByUserId
          ? this.users.get(billing.createdByUserId).catch(() => undefined)
          : undefined,
        billing.manualSettlementByUserId
          ? this.users
              .get(billing.manualSettlementByUserId)
              .catch(() => undefined)
          : undefined,
      ]);

    return {
      ...billing,
      workspace,
      createdByUser,
      manualSettlementByUser,
    } as any;
  }

  async get(_id: string) {
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id) },
    });
    if (!data)
      throw new NotFoundException(AppMessage.WORKSPACE_BILLING_NOT_FOUND);
    return data;
  }

  async report(
    args: WithOptionalWorkspaceArgs<{ query?: any }>,
  ): Promise<WorkspaceBalance> {
    const [billings] = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        query: {
          ...args.query,
          getAll: true,
        },
      }),
    );

    const balance = [...billings].reduce((acc, billing) => {
      if (billing.status === WorkspaceBillingStatus.PAID)
        return acc + billing.amount;
      return acc;
    }, 0);

    const pendingPayment = [...billings].reduce((acc, billing) => {
      if (
        billing.type === WorkspaceBillingType.PAYMENT &&
        billing.status === WorkspaceBillingStatus.PENDING
      )
        return acc + billing.amount;
      return acc;
    }, 0);

    return {
      balance,
      pendingPayment,
    };
  }

  async list(args: WithOptionalWorkspaceArgs<{ query?: any }>) {
    const billings = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['code', 'amount', 'type', 'status'],
      }),
    );

    return {
      count: billings[1],
      data: billings[0],
      report: await this.report(args),
    };
  }

  async deposit(workspaceId: any, dto: WorkspaceBillingDepositDto) {
    const workspace = await this.workspaces.get(workspaceId);

    const billing = new WorkspaceBillingEntity();
    billing.amount = Math.abs(dto.amount);
    billing.workspaceId = workspace._id.toString();
    billing.type = WorkspaceBillingType.DEPOSIT;
    billing.note = dto.note;
    billing.manualSettlementByUserId = dto.manualSettlementByUserId;
    billing.relatedBankTransactionId = dto.relatedBankTransactionId;
    billing.status = WorkspaceBillingStatus.PAID;

    await this.save(billing, workspace);

    this.queueProducers.captureEvent({
      type: EventType.WORKSPACE_BILLINGS_DEPOSITED,
      actionType: EventDataActionType.CREATE,
      workspaceId: workspace._id.toString(),
      data: billing,
      persist: true,
    });

    return billing;
  }

  async withdraw(member: WorkspaceMember, dto: WorkspaceBillingDepositDto) {
    const billing = new WorkspaceBillingEntity();
    billing.amount = -Math.abs(dto.amount);
    billing.workspaceId = member.workspaceId;
    billing.type = WorkspaceBillingType.WITHDRAW;
    billing.status = WorkspaceBillingStatus.PENDING;
    return this.save(billing, member.workspace);
  }

  async addPayment(workspaceId: any, dto: WorkspaceBillingPaymentDto) {
    const workspace = await this.workspaces.get(workspaceId);
    const billing = new WorkspaceBillingEntity();
    billing.amount = -Math.abs(dto.amount);
    billing.workspaceId = workspace._id.toString();
    billing.type = WorkspaceBillingType.PAYMENT;
    billing.relatedWorkspaceSubscriptionId = dto.relatedWorkspaceSubscriptionId;
    billing.isOnNotification = dto.isOnNotification;
    billing.data = dto.data;

    // Auto Payment
    const wsBalance = await this.report({ workspace });
    if (wsBalance.balance >= dto.amount) {
      billing.status = WorkspaceBillingStatus.PAID;
    } else {
      billing.status = WorkspaceBillingStatus.PENDING;
    }

    await this.save(billing, workspace);

    if (billing.status === WorkspaceBillingStatus.PAID) {
      this.queueProducers.captureEvent({
        type: EventType.WORKSPACE_BILLINGS_PAYMENT_PAID,
        actionType: EventDataActionType.UPDATE,
        workspaceId: billing.workspaceId,
        data: billing,
      });
    } else {
      this.queueProducers.captureEvent({
        type: EventType.WORKSPACE_BILLINGS_PAYMENT_NEW,
        actionType: EventDataActionType.CREATE,
        workspaceId: billing.workspaceId,
        data: { money: billing.amount },
      });
    }

    return billing;
  }

  async addCashback(workspaceId: any, dto: WorkspaceBillingCashbackDto) {
    const workspace = await this.workspaces.get(workspaceId);
    const billing = new WorkspaceBillingEntity();
    billing.amount = Math.abs(dto.amount);
    billing.workspaceId = workspace._id.toString();
    billing.type = WorkspaceBillingType.CASHBACK;
    billing.relatedWorkspaceSubscriptionId = dto.relatedWorkspaceSubscriptionId;
    billing.status = WorkspaceBillingStatus.PAID;
    await this.save(billing, workspace);

    this.queueProducers.captureEvent({
      type: EventType.WORKSPACE_BILLINGS_CASHBACK_NEW,
      actionType: EventDataActionType.CREATE,
      workspaceId: billing.workspaceId,
      data: billing,
    });

    return billing;
  }

  async autoPayment(workspaceId: string) {
    const pending = await this.repository.find({
      where: {
        workspaceId,
        status: WorkspaceBillingStatus.PENDING,
        type: WorkspaceBillingType.PAYMENT,
      },
    });

    const workspace = await this.workspaces.get(workspaceId);

    for (let i = 0; i < pending.length; i++) {
      const billing = pending[i];
      const balance = await this.report({ workspace });
      if (balance.balance >= billing.amount) {
        billing.status = WorkspaceBillingStatus.PAID;
        await this.repository.save(billing);

        this.queueProducers.captureEvent({
          type: EventType.WORKSPACE_BILLINGS_PAYMENT_PAID,
          actionType: EventDataActionType.UPDATE,
          workspaceId: billing.workspaceId,
          data: billing,
        });
      }
    }

    return pending;
  }
}
