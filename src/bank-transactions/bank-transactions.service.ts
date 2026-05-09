import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PayOs from '@payos/node';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { wait } from '../utils/wait.utils';
import { WorkspaceBillingsService } from '../workspace-billings/workspace-billings.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { encodeWorkspace } from '../workspaces/workspaces.utils';
import { BankTransactionEntity } from './bank-transactions.entity';
import {
  BankTransactionCallbackDto,
  BankTransactionPaymentGateway,
  BankTransactionStatus,
  BankTransactionType,
  CreateBankTransactionDto,
} from './bank-transactions.types';

@Injectable()
export class BankTransactionsService {
  payOs: any;

  constructor(
    @InjectRepository(BankTransactionEntity, DatabaseName.MONGO)
    private repository: MongoRepository<BankTransactionEntity>,
    private readonly workspaceBillings: WorkspaceBillingsService,
    private readonly queueProducers: QueueProducersService,
  ) {
    // TODO:
    // this.payOs = new PayOs(
    //   configs.SYS_PAY_OS_CLIENT_ID,
    //   configs.SYS_PAY_OS_API_KEY,
    //   configs.SYS_PAY_OS_CHECKSUM_KEY,
    // );
  }

  async getNextCode(workspace: WorkspaceEntity) {
    const count = await this.repository.findAndCount({
      where: { workspaceId: workspace._id.toString() },
      order: { createdAt: -1 },
      take: 0,
    });

    return encodeWorkspace({
      workspaceCode: workspace.code,
      code: `${count[1] + 1}`,
      entity: AppEntity.BANK_TRANSACTIONS,
    });
  }

  async save(data: BankTransactionEntity, ws: WorkspaceEntity) {
    let retryTime = 0;
    let code = '';

    const action = async () => {
      try {
        const [_, length] = await this.repository.findAndCount({
          take: 1,
          skip: 0,
        });

        code = await this.getNextCode(ws);
        data.code = code;
        data.orderCode = +configs.PAYMENT_ORDER_CODE_START_AT + length + 1;
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

  async get(id: any) {
    const tx = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!tx) throw new HttpException(AppMessage.DATA_NOT_FOUND, 404);
    return tx;
  }

  async payOsConfirmWebhook() {
    const webhookURL = `${configs.API_URL}/bank-transactions/webhook`;
    await this.payOs.confirmWebhook(webhookURL);
  }

  async payOsGetPaymentLinkInformation(orderId: string | number) {
    try {
      const order = await this.payOs.getPaymentLinkInformation(orderId);
      return order;
    } catch (error) {
      return null;
    }
  }

  async webhook(body: any) {
    const paymentLinkId = body?.data?.paymentLinkId;
    const payOsTx = await this.payOsGetPaymentLinkInformation(paymentLinkId);

    if (payOsTx) {
      const relatedTx = await this.repository.findOne({
        where: { paymentLinkId },
      });
      if (relatedTx && payOsTx.status === 'PAID')
        await this.paid(relatedTx._id.toString());
      if (relatedTx && payOsTx.status === 'CANCELLED')
        await this.cancel(relatedTx._id.toString());
    }
  }

  async callback(dto: BankTransactionCallbackDto) {
    if (dto.paymentLinkId) {
      const tx = await this.repository.findOne({
        where: { paymentLinkId: dto.paymentLinkId },
      });
      if (!tx) throw new HttpException(AppMessage.DATA_NOT_FOUND, 404);
      await this.webhook({ data: { paymentLinkId: tx.paymentLinkId } });
      return tx;
    }
  }

  async create(member: WorkspaceMember, dto: CreateBankTransactionDto) {
    const tx = new BankTransactionEntity();
    tx.workspaceId = member.workspaceId;
    tx.amount = dto.amount;
    tx.type = dto.type;
    tx.paymentGateway = dto.paymentGateway;
    tx.relatedReceiptId = dto.relatedReceiptId;
    tx.status = BankTransactionStatus.PENDING;
    tx.isFulfilled = false;

    await this.save(tx, member.workspace);

    try {
      if (tx.paymentGateway === BankTransactionPaymentGateway.PAY_OS) {
        tx.paymentData = await this.payOs.createPaymentLink({
          amount: tx.amount,
          cancelUrl: `${configs.APP_URL}/bank-transactions/callback`,
          returnUrl: `${configs.APP_URL}/bank-transactions/callback`,
          description: tx.code,
          orderCode: tx.orderCode,
        });
        tx.paymentLinkId = tx.paymentData.paymentLinkId;
        await this.repository.save(tx);
      } else {
        throw new BadRequestException(AppMessage.PAYMENT_GATEWAY_NOT_SUPPORT);
      }
    } catch (error) {
      logger.error(error, {
        fields: { tx: tx._id.toString() },
        case: `Failed when create payment link`,
      });

      tx.status = BankTransactionStatus.FAILED;
      tx.failedReason = 'Failed when create payment link';
      await this.repository.save(tx);

      this.queueProducers.captureEvent({
        type: EventType.BANK_TRANSACTION_FAILED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: tx.workspaceId,
        data: tx,
        persist: true,
      });
    }

    return tx;
  }

  async cancel(id: string, reason?: string) {
    const tx = await this.get(id);
    if (tx.status !== BankTransactionStatus.PENDING) return tx;
    tx.status = BankTransactionStatus.CANCELLED;
    tx.failedReason = reason;
    await this.repository.save(tx);

    this.queueProducers.captureEvent({
      type: EventType.BANK_TRANSACTION_CANCELLED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: tx.workspaceId,
      data: tx,
      persist: true,
    });

    return tx;
  }

  async paid(id: string) {
    const tx = await this.get(id);
    if (tx.status !== BankTransactionStatus.PENDING) return tx;

    // Paid
    tx.status = BankTransactionStatus.PAID;
    await this.repository.save(tx);

    this.queueProducers.captureEvent({
      type: EventType.BANK_TRANSACTION_PAID,
      actionType: EventDataActionType.UPDATE,
      workspaceId: tx.workspaceId,
      data: tx,
      persist: true,
    });

    // Fulfill
    await wait(200);

    if (tx.type === BankTransactionType.WORKSPACE_BILLINGS_DEPOSIT) {
      await this.workspaceBillings.deposit(tx.workspaceId, {
        amount: tx.amount,
        relatedBankTransactionId: tx._id.toString(),
      });
    }

    tx.isFulfilled = true;
    await this.repository.save(tx);

    this.queueProducers.captureEvent({
      type: EventType.BANK_TRANSACTION_FULFILLED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: tx.workspaceId,
      data: tx,
      persist: true,
    });

    return tx;
  }
}
