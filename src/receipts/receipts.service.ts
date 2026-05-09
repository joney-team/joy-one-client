import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { Between, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity, Period } from '../app.types';
import { CustomersService } from '../customers/customers.service';
import { DatabaseService } from '../database/database.service';
import { DatabaseName, TransactionNode } from '../database/database.types';
import {
  bindData,
  entitySelector,
  safeBindData,
  withPostgresQuery,
} from '../database/database.utils';
import {
  EventDataActionType,
  EventType,
  EventVariant,
} from '../events/events.types';
import { LoansService } from '../loans/loans.service';
import { getLoanReceiptReport } from '../loans/loans.utils';
import { OrdersService } from '../orders/orders.service';
import { OrderDiscountType } from '../orders/orders.types';
import { PartnerEntity } from '../partners/partners.entity';
import { PartnersService } from '../partners/partners.service';
import { ProductCombosService } from '../product-combos/product-combos.service';
import { ProductsService } from '../products/products.service';
import { ProductType } from '../products/products.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import {
  ExportReportByRangeTimeInput,
  ReportTimeSeriesInput,
} from '../reports/reports.types';
import { getReportTimeRange } from '../reports/reports.utils';
import { DateTime } from '../utils/date-time';
import { isDiff } from '../utils/diff.utils';
import { wait } from '../utils/wait.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import {
  decodeWorkspace,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { ReceiptEntity } from './entities/receipt.entity';
import {
  CreateReceiptInput,
  DisburseReceiptInput,
  PartialPaymentInput,
  PayReceiptInput,
  ReceiptEventData,
  ReceiptPaymentMethod,
  ReceiptReportItem,
  ReceiptReportRelatedEntity,
  ReceiptsTimeSeriesReport,
  ReceiptsMetricsReport,
  ReceiptStatus,
  ReceiptType,
  UpdateReceiptInput,
  UpdateReceiptPaidAtDto,
} from './receipts.types';
import { CursorEntity } from '../database/database.cursor';
import { CustomerShortInfo } from '../customers/customers.types';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(ReceiptEntity, DatabaseName.POSTGRES)
    public readonly repository: Repository<ReceiptEntity>,

    private readonly products: ProductsService,
    private readonly partners: PartnersService,
    private readonly database: DatabaseService,

    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
    @Inject(forwardRef(() => ProductCombosService))
    private readonly productCombos: ProductCombosService,
    @Inject(forwardRef(() => LoansService))
    private readonly loans: LoansService,
    @Inject(forwardRef(() => CustomersService))
    private readonly customers: CustomersService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orders: OrdersService,
    @Inject(forwardRef(() => WorkspaceBranchesService))
    private readonly workspaceBranches: WorkspaceBranchesService,

    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(
    args: WithOptionalWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { id, node } = args;
    const { member } = withOptionalWorkspaceArgs(args);

    return this.database.runTransaction({
      isReadonly: true,
      node,
      handler: async (ctx) => {
        const data = await ctx.manager.findOne(ReceiptEntity<any>, {
          where: ObjectId.isValid(id)
            ? {
                _id: id,
              }
            : {
                id,
              },
        });

        if (!data) {
          throw new NotFoundException(AppMessage.RECEIPT_NOT_FOUND);
        }

        if (member) validateWorkspaceAccessable({ data, member });

        return data;
      },
    });
  }

  async getByCode(
    args: WithWorkspaceArgs<{ code: string; node?: TransactionNode }>,
  ) {
    const { code, member, node } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      isReadonly: true,
      node,
      handler: async (ctx) => {
        const data = await ctx.manager.findOne(ReceiptEntity<any>, {
          where: { code },
        });

        if (!data) {
          throw new NotFoundException(AppMessage.RECEIPT_NOT_FOUND);
        }

        if (member) validateWorkspaceAccessable({ data, member });

        return data;
      },
    });
  }

  async getByRef(ref: string, node?: TransactionNode) {
    return this.database.runTransaction({
      isReadonly: true,
      node,
      handler: async (ctx) => {
        const data = await ctx.manager.findOne(ReceiptEntity, {
          where: { ref },
        });
        if (!data)
          throw new NotFoundException(AppMessage.RECEIPT_NOT_FOUND, {
            cause: { ref },
          });
        return data;
      },
    });
  }

  async getOrCreateByRef(
    args: WithWorkspaceArgs<{
      ref: string;
      dto: CreateReceiptInput;
      status?: ReceiptStatus;
      paymentMethod?: ReceiptPaymentMethod;
      node?: TransactionNode;
      paidAt?: number;
    }>,
  ) {
    const { ref, dto, status, node, paidAt } = args;
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const { workspace, member } = withWorkspaceArgs(args);
        const receipt =
          (await ctx.manager.findOne(ReceiptEntity, { where: { ref } })) ||
          new ReceiptEntity();

        if (!receipt.id) {
          receipt.id = uuid();
          receipt.ref = ref;
          receipt.type = dto.type;
          receipt.workspaceId = workspace._id.toString();
          receipt.amount = this.getReceiptAmount({
            type: dto.type,
            amount: dto.amount,
          });
          receipt.tipAmount = dto.tipAmount ?? 0;
          receipt.expireAt = dto.expireAt;
          receipt.data = dto.data;
          receipt.note = dto.note;
          receipt.assigneeUserIds = dto.assigneeUserIds || [];
          receipt.createdByUserId = member?.userId;
          receipt.relatedEntities = dto.relatedEntities || [];
          receipt.status = status || ReceiptStatus.PENDING;
          receipt.paymentMethod = args.paymentMethod;
          receipt.relatedCustomerId = dto.relatedCustomerId ?? null;

          if (dto.relatedLoanId) {
            const loan = await this.loans.get({
              id: dto.relatedLoanId,
              node: ctx.node,
            });
            receipt.relatedLoanCode = loan.code;
            receipt.relatedLoanId = loan.id;
          } else {
            receipt.relatedLoanCode = null;
            receipt.relatedLoanId = null;
          }

          if (receipt.status === ReceiptStatus.PAID) {
            receipt.cashierUserId = member?.userId;
            receipt.paidAt = paidAt ?? DateTime.getNowInSeconds();
          }

          receipt.relatedEntities = this.bindRelatedEntities(receipt);

          receipt.code = await this.getNextCode({
            workspace,
            node: ctx.node,
          });

          receipt.ref = receipt.ref || dto.ref || receipt.code;
          await ctx.manager.save(receipt);
          return receipt;
        } else {
          return receipt;
        }
      },
    });
  }

  async bindData(entity: ReceiptEntity) {
    return bindData<
      {
        cashierUser?: WorkspaceMemberPublicInfo;
        disbursementUser?: WorkspaceMemberPublicInfo;
        relatedPartner?: PartnerEntity;
        workspaceBranch?: WorkspaceBranchEntity;
        relatedCustomer?: CustomerShortInfo;
      },
      ReceiptEntity<any>
    >({
      entity,
      extends: {
        workspaceBranch: safeBindData({
          entity,
          field: 'workspaceBranchId',
          fetch: () =>
            this.workspaceBranches.getWithCache({
              workspaceId: entity.workspaceId,
              _id: entity.workspaceBranchId,
            }),
        }),
        cashierUser: safeBindData({
          entity,
          field: 'cashierUserId',
          fetch: () =>
            this.workspaceMembers.getMemberInfo({
              userId: entity.cashierUserId,
              workspaceId: entity.workspaceId,
            }),
        }),
        disbursementUser: safeBindData({
          entity,
          field: 'disbursementUserId',
          fetch: () =>
            this.workspaceMembers.getMemberInfo({
              userId: entity.disbursementUserId,
              workspaceId: entity.workspaceId,
            }),
        }),
        relatedPartner: safeBindData({
          entity,
          field: 'relatedPartnerId',
          fetch: () =>
            this.partners.getWithCache({
              id: entity.relatedPartnerId,
              workspaceId: entity.workspaceId,
            }),
        }),
        relatedCustomer: safeBindData({
          entity,
          field: 'relatedCustomerId',
          fetch: () =>
            this.customers.getShortInfo({
              id: entity.relatedCustomerId,
              workspaceId: entity.workspaceId,
            }),
        }),
      },
    });
  }

  async bindEventData(
    receipt: ReceiptEntity,
    cashier?: WorkspaceMember,
  ): Promise<ReceiptEventData> {
    const customer = receipt.relatedCustomerId
      ? await this.customers
          .get({
            id: receipt.relatedCustomerId,
            workspaceId: receipt.workspaceId,
          })
          .then((c) => c.name)
      : null;

    return {
      code: receipt.code,
      money: receipt.amount,
      cashier: cashier?.name,
      customer,
      note: receipt.note,
      type: receipt.type,
    };
  }

  async getNextCode(args: {
    workspace: WorkspaceEntity;
    node: TransactionNode;
  }) {
    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const cursorRef = `receipts:${args.workspace._id.toString()}`;

        let cursor = await ctx.manager
          .createQueryBuilder(CursorEntity, 'cursor')
          .where('cursor.ref = :ref', { ref: cursorRef })
          .setLock('pessimistic_write')
          .getOne();

        if (!cursor) {
          cursor = new CursorEntity();
          cursor.ref = cursorRef;
          cursor.count = await ctx.manager.count(ReceiptEntity, {
            where: {
              workspaceId: args.workspace._id.toString(),
            },
          });
        } else {
          cursor.count += 1;
        }

        await ctx.save(cursor);
        return `${args.workspace.code}R${(cursor.count ?? 0) + 1}`;
      },
    });
  }

  getReceiptAmount(args: { type: ReceiptType; amount: number }) {
    return args.type === ReceiptType.INCOME
      ? Math.abs(args.amount)
      : -Math.abs(args.amount);
  }

  bindRelatedEntities(receipt: ReceiptEntity) {
    const relatedEntities = [
      { entity: AppEntity.CUSTOMERS, id: receipt.relatedCustomerId },
      { entity: AppEntity.LOANS, id: receipt.relatedLoanId, index: true },
      { entity: AppEntity.ORDERS, id: receipt.relatedOrderId, index: true },
      { entity: AppEntity.PARTNERS, id: receipt.relatedPartnerId },
      ...(receipt.assigneeUserIds || []).map((userId) => ({
        entity: AppEntity.USERS,
        id: userId,
      })),
    ].filter(
      (data) => data.id !== undefined && data.id !== null && data.id !== '',
    );

    return relatedEntities;
  }

  async create(
    args: WithWorkspaceArgs<{
      input: CreateReceiptInput;
      createdAt?: number;
      node?: TransactionNode;
    }>,
  ) {
    const { input, createdAt, node } = args;
    const { workspace, member } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const receipt = new ReceiptEntity();
        receipt.id = uuid();
        receipt.workspaceId = workspace._id.toString();
        receipt.workspaceBranchId = input.workspaceBranchId;
        receipt.amount = this.getReceiptAmount({
          type: input.type,
          amount: input.amount,
        });
        receipt.status = ReceiptStatus.PENDING;
        receipt.createdAt = createdAt ?? DateTime.getNowInSeconds();
        receipt.type = input.type;
        receipt.note = input.note;
        receipt.assigneeUserIds = input.assigneeUserIds || [];
        receipt.tipAmount = input.tipAmount ?? 0;
        receipt.ref = input.ref;
        receipt.relatedTicketId = input.relatedTicketId;
        receipt.relatedOrderId = input.relatedOrderId;
        receipt.relatedPartnerId = input.relatedPartnerId;
        receipt.expireAt = input.expireAt;
        receipt.data = input.data;
        receipt.createdByUserId = member?.userId;
        receipt.cashierUserId = member?.userId;
        receipt.relatedCustomerId = input.relatedCustomerId ?? null;

        if (input.relatedLoanId) {
          const loan = await this.loans.get({
            id: input.relatedLoanId,
            node: ctx.node,
          });
          receipt.relatedLoanCode = loan.code;
          receipt.relatedLoanId = loan.id;
        } else {
          receipt.relatedLoanCode = null;
          receipt.relatedLoanId = null;
        }

        receipt.relatedEntities = this.bindRelatedEntities(receipt);

        if (input.ref) {
          const existed = await ctx.manager.findOne(ReceiptEntity, {
            where: { ref: input.ref },
          });

          if (existed) {
            throw new BadRequestException(
              AppMessage.RECEIPT_REF_ALREADY_EXISTS,
            );
          }

          receipt.ref = input.ref;
        }

        receipt.code = await this.getNextCode({
          node: ctx.node,
          workspace,
        });

        receipt.ref = input.ref || receipt.code;

        await ctx.manager.save(receipt);

        return receipt;
      },
      onCommitted: async (receipt) => {
        this.queueProducers.captureEvent({
          type: EventType.RECEIPT_NEW,
          actionType: EventDataActionType.CREATE,
          ref: receipt.id,
          userId: member?.userId,
          workspaceId: receipt.workspaceId,
          persist: true,
          time: receipt.createdAt,
          data: await this.bindEventData(receipt),
          relatedEntities: [
            { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
            ...(receipt.relatedEntities || []),
          ],
          reportTimeRange: getReportTimeRange(receipt.createdAt),
        });
      },
    });
  }

  async update(
    args: WithWorkspaceArgs<{
      id: string;
      input: UpdateReceiptInput;
      isArchived?: boolean;
      node?: TransactionNode;
    }>,
  ) {
    const { input, member, node } = withWorkspaceArgs(args);
    const receipt = await this.get(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        receipt.dataChanged = receipt.dataChanged || {};

        if (input.amount !== receipt.amount) receipt.dataChanged.amount = true;
        if (input.paymentMethod !== receipt.paymentMethod)
          receipt.dataChanged.paymentMethod = true;

        receipt.amount = input.amount;
        receipt.data = input.data;
        receipt.expireAt = input.expireAt;
        receipt.note = input.note;
        receipt.cashierUserId = input.cashierUserId;
        receipt.assigneeUserIds = input.assigneeUserIds || [];
        receipt.tipAmount = input.tipAmount ?? 0;
        receipt.paymentMethod = input.paymentMethod;
        receipt.paidAt = input.paidAt;
        receipt.relatedCustomerId = input.relatedCustomerId ?? null;
        receipt.relatedEntities = this.bindRelatedEntities(receipt);

        if (typeof input.isFixedAmount === 'boolean') {
          receipt.isFixedAmount = input.isFixedAmount;
        }

        if (typeof args.isArchived === 'boolean') {
          receipt.isArchived = args.isArchived;
        }

        await ctx.manager.save(receipt);
        return receipt;
      },
      onCommitted: (receipt) => {
        this.queueProducers.captureEvent({
          ref: receipt.id.toString(),
          type: EventType.RECEIPT_UPDATED,
          actionType: EventDataActionType.UPDATE,
          userId: member?.userId,
          workspaceId: receipt.workspaceId,
          persist: !!member,
          relatedEntities: [
            { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
            ...(receipt.relatedEntities || []),
          ],
          reportTimeRange: getReportTimeRange(receipt.updatedAt),
        });
      },
    });
  }

  async pay(
    args: WithWorkspaceArgs<{
      id: string;
      input: PayReceiptInput;
      paidAt?: number;
      node?: TransactionNode;
    }>,
  ) {
    const { id, input, member, paidAt, node } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const receipt = await this.get({ id, member, node });

        if (receipt.status === ReceiptStatus.PAID) {
          throw new BadRequestException(AppMessage.RECEIPT_ALREADY_PAID);
        }

        receipt.status = ReceiptStatus.PAID;
        receipt.cashierUserId = member?.userId;
        receipt.paidAt = paidAt ?? DateTime.getNowInSeconds();
        receipt.paymentMethod = input.paymentMethod || receipt.paymentMethod;
        receipt.giveAmount = input.giveAmount ?? null;
        receipt.relatedEntities = this.bindRelatedEntities(receipt);

        await ctx.manager.save(receipt);
        return receipt;
      },
      onCommitted: async (receipt) => {
        this.queueProducers.captureEvent({
          ref: receipt.id.toString(),
          actionType: EventDataActionType.UPDATE,
          type: EventType.RECEIPT_PAID,
          userId: member?.userId,
          workspaceId: member.workspaceId,
          persist: true,
          data: await this.bindEventData(receipt, member),
          relatedEntities: [
            { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
            ...(receipt.relatedEntities || []),
          ],
          reportTimeRange: getReportTimeRange(receipt.paidAt),
        });
      },
    });
  }

  async revertPayment(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const { id } = args;

    const receipt = await this.get({ id, member });

    if (receipt.workspaceId !== member.workspaceId)
      throw new ForbiddenException();

    if (receipt.status !== ReceiptStatus.PAID)
      throw new BadRequestException(AppMessage.RECEIPT_NOT_PAID_YET);

    receipt.status = ReceiptStatus.PENDING;
    receipt.disbursementUserId = null;

    await this.repository.save(receipt);

    this.queueProducers.captureEvent({
      type: EventType.RECEIPT_REVERT_PAYMENT,
      actionType: EventDataActionType.UPDATE,
      variant: EventVariant.WARNING,
      ref: receipt.id.toString(),
      userId: member?.userId,
      workspaceId: receipt.workspaceId,
      persist: true,
      data: await this.bindEventData(receipt),
      relatedEntities: [
        { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
        ...(receipt.relatedEntities || []),
      ],
      reportTimeRange: getReportTimeRange(receipt.paidAt),
    });

    return receipt;
  }

  async disburse(
    args: WithWorkspaceArgs<{
      id: string;
      input: DisburseReceiptInput;
      node?: TransactionNode;
    }>,
  ) {
    const { id, input, member, node } = withWorkspaceArgs(args);
    const receipt = await this.get({ id, member, node });

    if (receipt.status === ReceiptStatus.PAID) {
      throw new BadRequestException(AppMessage.RECEIPT_ALREADY_DISBURSEMENT);
    }

    if (receipt.ref) {
      const existed = await this.repository.findOne({
        where: {
          ref: receipt.ref,
          status: ReceiptStatus.PAID,
        },
      });

      if (existed) {
        throw new BadRequestException(AppMessage.RECEIPT_ALREADY_DISBURSEMENT);
      }
    }

    receipt.paidAt = DateTime.getNowInSeconds();
    receipt.disbursementUserId = member?.userId;
    receipt.status = ReceiptStatus.PAID;
    receipt.paymentMethod = input.paymentMethod;
    receipt.relatedCustomerId = input.relatedCustomerId;
    receipt.relatedLoanId = input.relatedLoanId;

    await this.repository.save(receipt);

    this.queueProducers.captureEvent({
      ref: receipt.id.toString(),
      type: EventType.RECEIPT_DISBURSEMENT,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      workspaceId: receipt.workspaceId,
      persist: true,
      relatedEntities: [
        { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
        ...(receipt.relatedEntities || []),
      ],
      reportTimeRange: getReportTimeRange(receipt.paidAt),
    });

    return receipt;
  }

  async partialPayment(
    args: WithWorkspaceArgs<{
      id: string;
      input: PartialPaymentInput;
      node?: TransactionNode;
    }>,
  ) {
    const { id, input, member, node } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const receipt = await this.get({ id, member, node: ctx.node });
        const remainAmount = receipt.amount - input.amount;

        if (remainAmount <= 0) {
          throw new BadRequestException(AppMessage.INVALID_AMOUNT);
        }

        if (receipt.type !== ReceiptType.INCOME) {
          throw new BadRequestException(AppMessage.INVALID_PAYLOAD);
        }

        // Archive old receipt
        await this.archive({
          id: receipt.id,
          member,
          node: ctx.node,
        });

        // Create new receipts
        const refStart = receipt.ref + '-PARTIAL';
        let partialReceipt: ReceiptEntity;
        let nextReceipt: ReceiptEntity;

        const partialReceiptExisted = await this.repository.findOne({
          where: { ref: refStart },
        });
        if (partialReceiptExisted) {
          partialReceipt = await this.update({
            id: partialReceiptExisted.id,
            input: {
              ...receipt,
              amount: input.amount,
              expireAt: receipt.expireAt,
              data: {
                ...receipt.data,
                partial: true,
                fromPartialReceiptId: receipt.id,
              },
            },
            member,
            isArchived: false,
            node: ctx.node,
          });
        } else {
          partialReceipt = await this.create({
            member,
            input: {
              ...receipt,
              ref: refStart,
              amount: input.amount,
              expireAt: receipt.expireAt,
              data: {
                ...receipt.data,
                partial: true,
                fromPartialReceiptId: receipt.id,
              },
            },
            createdAt: receipt.createdAt,
            node: ctx.node,
          });
        }

        const refNext = receipt.ref + '-NEXT';

        const nextReceiptExisted = await this.repository.findOne({
          where: { ref: refNext },
        });
        if (nextReceiptExisted) {
          nextReceipt = await this.update({
            id: nextReceiptExisted.id,
            input: {
              ...receipt,
              amount: remainAmount,
              expireAt: input.nextExpireAt,
              data: {
                ...receipt.data,
                remainPartial: true,
                fromPartialReceiptId: receipt.id,
              },
            },
            member,
            isArchived: false,
            node: ctx.node,
          });
        } else {
          nextReceipt = await this.create({
            member,
            input: {
              ...receipt,
              ref: refNext,
              amount: remainAmount,
              expireAt: input.nextExpireAt,
              data: {
                ...receipt.data,
                remainPartial: true,
                fromPartialReceiptId: receipt.id,
              },
            },
            createdAt: receipt.createdAt,
            node: ctx.node,
          });
        }

        return {
          receipts: [partialReceipt, nextReceipt],
        };
      },
    });
  }

  async updatePaidAt(
    id: string,
    dto: UpdateReceiptPaidAtDto,
    member?: WorkspaceMember,
  ) {
    const receipt = await this.get({ id, member });

    if (receipt.status !== ReceiptStatus.PAID) {
      throw new BadRequestException(AppMessage.RECEIPT_NOT_PAID_YET);
    }

    const reportTimeRange: ReportTimeSeriesInput = {
      fromTime: Math.min(receipt.paidAt, dto.paidAt),
      toTime: Math.max(receipt.paidAt, dto.paidAt),
    };

    receipt.paidAt = dto.paidAt;

    await this.repository.save(receipt);

    this.queueProducers.captureEvent({
      ref: receipt.id.toString(),
      type: EventType.RECEIPT_UPDATED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      workspaceId: receipt.workspaceId,
      persist: !!member,
      relatedEntities: [
        { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
        ...(receipt.relatedEntities || []),
      ],
      reportTimeRange,
    });
  }

  async archive(
    args: WithWorkspaceArgs<{
      id: string;
      node?: TransactionNode;
    }>,
  ) {
    const { member, node } = withWorkspaceArgs(args);
    const receipt = await this.get(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        receipt.isArchived = true;
        await ctx.manager.save(receipt);
        return receipt;
      },
      onCommitted: (receipt) => {
        this.queueProducers.captureEvent({
          ref: receipt.id.toString(),
          type: EventType.RECEIPT_ARCHIVED,
          actionType: EventDataActionType.ARCHIVED,
          variant: EventVariant.NEGATIVE,
          userId: member?.userId,
          workspaceId: receipt.workspaceId,
          persist: !!member,
          relatedEntities: [
            { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
            ...(receipt.relatedEntities || []),
          ],
          reportTimeRange: getReportTimeRange(receipt.paidAt),
        });
      },
    });
  }

  async unarchive(args: {
    id: string;
    member?: WorkspaceMember;
    node?: TransactionNode;
  }) {
    const { id, member, node } = args;

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const receipt = await this.get({ id, member, node: ctx.node });
        receipt.isArchived = false;
        await ctx.manager.save(receipt);
        return receipt;
      },
      onCommitted: (receipt) => {
        this.queueProducers.captureEvent({
          type: EventType.RECEIPT_UNARCHIVED,
          actionType: EventDataActionType.UPDATE,
          userId: member?.userId,
          workspaceId: receipt.workspaceId,
          ref: receipt.id.toString(),
          persist: true,
          relatedEntities: [
            { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
            ...(receipt.relatedEntities || []),
          ],
          reportTimeRange: getReportTimeRange(receipt.paidAt),
        });
      },
    });
  }

  async updateWorkspaceBranch(
    args: WithOptionalWorkspaceArgs<{
      id: string;
      workspaceBranchId: string | null;
      node?: TransactionNode;
    }>,
  ) {
    const { member } = withOptionalWorkspaceArgs(args);
    const { workspaceBranchId } = args;

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const receipt = await this.get(args);
        receipt.workspaceBranchId = workspaceBranchId ?? null;
        await ctx.manager.save(receipt);
        return receipt;
      },
      onCommitted: async (receipt) => {
        this.queueProducers.captureEvent({
          type: EventType.RECEIPT_CHANGE_WORKSPACE_BRANCH,
          actionType: EventDataActionType.UPDATE,
          userId: member?.userId,
          workspaceId: receipt.workspaceId,
          ref: receipt.id.toString(),
          persist: true,
          relatedEntities: [
            { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
            ...(receipt.relatedEntities || []),
          ],
          reportTimeRange: getReportTimeRange(receipt.paidAt),
        });
      },
    });
  }

  async list<T = any>(
    args: WithWorkspaceArgs<{ query?: any }>,
  ): Promise<{
    total: number;
    results: ReceiptEntity<T>[];
  }> {
    const findOptions = withPostgresQuery<ReceiptEntity>({
      ...args,
      filterFields: [
        'ref',
        'code',
        'cashierUserId',
        'disbursementUserId',
        'status',
        'type',
        'paymentMethod',
        'relatedCustomerId',
        'relatedTicketId',
        'relatedLoanId',
        'relatedLoanCode',
        'relatedPartnerId',
        'relatedOrderId',
      ],
      filterRangeFields: ['paidAt'],
      filterTimeRangeFields: ['paidAt'],
      sortFields: ['amount', 'tipAmount', 'paidAt', 'expireAt'],
    });

    let data: [ReceiptEntity<any>[], number];

    if (!!args.query.today) {
      const { start, end } = DateTime.getRange(new Date(), 'day');
      const startInSeconds = DateTime.toSeconds(start);
      const endInSeconds = DateTime.toSeconds(end);

      const todayQueryOptions: any = [
        { paidAt: Between(startInSeconds, endInSeconds) },
        { createdAt: Between(startInSeconds, endInSeconds) },
        { expireAt: Between(startInSeconds, endInSeconds) },
      ].map((option) => {
        return {
          ...findOptions.where,
          ...option,
        };
      });

      data = await this.repository.findAndCount({
        where: todayQueryOptions,
        order: findOptions.order,
      });
    } else {
      data = await this.repository.findAndCount(findOptions);
    }

    return {
      total: data[1],
      results: data[0],
    };
  }

  async report(args: {
    id: string;
    userId?: string;
    receipt?: ReceiptEntity;
    member?: WorkspaceMember;
  }) {
    const receipt =
      args.receipt || (await this.get({ id: args.id, member: args.member }));

    const reportItems: ReceiptReportItem[] = [];

    // Orders
    if (receipt.relatedOrderId) {
      const order = await this.orders.sync({ id: receipt.relatedOrderId });
      const combos = await this.productCombos.getByIds({
        ids: order.comboIds,
        workspaceId: order.workspaceId,
      });

      let orderAmount = order.totalAmount;
      let receiptAmount = receipt.amount;

      if (args.userId) {
        order.discounts.forEach((discount) => {
          if (discount.type === OrderDiscountType.COMBO) {
            orderAmount += discount.amount;
            receiptAmount += discount.amount;
          }
        });
      }

      for (const item of order.items) {
        const product = await this.products.get({ id: item.productId });

        const relatedEntities: ReceiptReportRelatedEntity[] = [
          {
            type: 'RECEIPT',
            data: entitySelector(receipt, [
              'cashierUserId',
              'data',
              'amount',
              'createdAt',
              'paidAt',
              'ref',
              'paymentMethod',
              'expireAt',
              'disbursementUserId',
              'type',
              'paymentMethod',
            ]),
          },
          { type: 'ORDER', data: entitySelector(order, ['items']) },
        ];

        if (product.type === ProductType.COMBO) {
          if (!args.userId) {
            reportItems.push({
              ref: `${receipt.id}-${order._id}`,
              time: receipt.paidAt,
              relatedEntities: [
                ...relatedEntities,
                {
                  type: 'PRODUCT_COMBO',
                  data: entitySelector(product, [
                    '_id',
                    'name',
                    'type',
                    'price',
                  ]),
                },
              ],
              profit: receiptAmount,
              revenue: receiptAmount,
            });
            continue;
          }

          // TODO: Handle combo -> Revenue for saler
        }

        if ([ProductType.SERVICE, ProductType.PRODUCT].includes(product.type)) {
          const itemRevenue = item.revenueRate * receiptAmount;
          const receiptRevenueRate = receiptAmount / orderAmount;

          const relatedCombo = combos.find((v) =>
            v.productRefs.some((v) => v.productRefId === item.productId),
          );
          if (relatedCombo)
            relatedEntities.push({
              type: 'PRODUCT_COMBO',
              data: entitySelector(relatedCombo, []),
            });

          // For workspace report
          if (!args.userId) {
            reportItems.push({
              ref: `${receipt.id}-${order._id}`,
              time: receipt.paidAt,
              relatedEntities: [
                ...relatedEntities,
                {
                  type: 'PRODUCT',
                  data: {
                    _id: product._id.toString(),
                    name: product.name,
                    type: product.type,
                    qty: item.quantity * receiptRevenueRate,
                  },
                },
              ],
              profit: itemRevenue,
              revenue: itemRevenue,
            });

            continue;
          }

          // For user report
          let itemAssigneeUserIds = item.assigneeUserIds || [];
          if (itemAssigneeUserIds.length === 0)
            itemAssigneeUserIds = [...order.assigneeUserIds];
          if (!itemAssigneeUserIds.includes(args.userId)) continue;

          const itemAssigneeUserRevenue =
            itemRevenue / itemAssigneeUserIds.length;

          reportItems.push({
            ref: `${receipt.id}-${order._id}`,
            time: receipt.paidAt,
            relatedEntities: [
              ...relatedEntities,
              {
                type: 'PRODUCT',
                data: {
                  _id: product._id.toString(),
                  name: product.name,
                  type: product.type,
                  qty:
                    (item.quantity * receiptRevenueRate) /
                    itemAssigneeUserIds.length,
                },
              },
            ],
            profit: itemAssigneeUserRevenue,
            revenue: itemAssigneeUserRevenue,
          });
        }

        continue;
      }
    }

    // Capture loan
    if (receipt.relatedLoanId) {
      if (
        !args.userId ||
        args.userId === receipt.cashierUserId ||
        args.userId === receipt.disbursementUserId
      ) {
        reportItems.push({
          ref: `${receipt.id}-${receipt.relatedLoanId}`,
          time: receipt.paidAt,
          relatedEntities: [],
          profit: receipt.amount,
          revenue: receipt.amount,
          loan: getLoanReceiptReport(receipt),
        });
      }
    }

    return reportItems;
  }

  async timeSeriesReport(
    input: ExportReportByRangeTimeInput,
  ): Promise<ReceiptsTimeSeriesReport> {
    const { userId } = input;

    const receipts = (await this.list({
      workspaceId: input.workspaceId,
      query: {
        status: ReceiptStatus.PAID,
        rangePaidAt: `${input.fromTime}-${input.toTime}`,
        workspaceBranchIds: input.workspaceBranchIds,
        getAll: true,
      },
    }).then((r) =>
      Promise.all(r.results.map((v) => this.bindData(v))),
    )) as ReceiptEntity[];

    let reportItems: ReceiptReportItem[] = [];

    for (const receipt of receipts) {
      const _items = await this.report({ id: receipt.id, userId, receipt });
      reportItems.push(..._items);
    }

    const reportItemsDuplicated = reportItems.reduce((out, v) => {
      const count = reportItems.filter(
        (k) => JSON.stringify(k) === JSON.stringify(v),
      ).length;
      const isAdded = out.find((k) => JSON.stringify(k) === JSON.stringify(v));
      if (count > 1 && !isAdded) {
        out.push(v);
      }
      return out;
    }, []);

    if (reportItemsDuplicated.length > 0) {
      logger.error(new Error('Duplicated report items'), {
        fields: {
          items: JSON.stringify(reportItemsDuplicated),
        },
      });
    }

    return {
      items: reportItems,
      totalRevenue: reportItems.reduce(
        (total, report) => total + report.revenue,
        0,
      ),
      totalProfit: reportItems.reduce(
        (total, report) => total + report.profit,
        0,
      ),
      totalReceipts: receipts.length,
      revenue: reportItems.reduce((total, report) => total + report.revenue, 0),
      loanCapital: reportItems.reduce(
        (total, report) => total + (report.loan?.capital ?? 0),
        0,
      ),
      loanFee: reportItems.reduce(
        (total, report) => total + (report.loan?.fee ?? 0),
        0,
      ),
      loanExpense: reportItems.reduce(
        (total, report) => total + (report.loan?.expense ?? 0),
        0,
      ),
    };
  }

  async metricsReport(member: WorkspaceMember): Promise<ReceiptsMetricsReport> {
    const paidToday = await this.list({
      member,
      query: {
        status: ReceiptStatus.PAID,
        timeRangePaidAt: `${Period.DATE}-${DateTime.getNowInSeconds()}`,
        getAll: true,
      },
    });

    return {
      revenueToday: paidToday.results.reduce(
        (total, receipt) => total + receipt.amount,
        0,
      ),
    };
  }

  async sync(id: string) {
    const receipt = await this.get({ id });
    let isNeedUpdate = false;

    if (isNeedUpdate) {
      await this.repository.save(receipt);
      this.queueProducers.captureEvent({
        type: EventType.RECEIPT_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: receipt.workspaceId,
        ref: receipt.id.toString(),
        relatedEntities: [
          { entity: AppEntity.RECEIPTS, id: receipt.id, index: true },
          { entity: AppEntity.CUSTOMERS, id: receipt.relatedCustomerId },
          { entity: AppEntity.LOANS, id: receipt.relatedLoanId },
          { entity: AppEntity.ORDERS, id: receipt.relatedOrderId },
        ],
      });
    }

    return receipt;
  }

  async syncCustomer(customerId: string) {
    const receipts = await this.repository.find({
      where: { relatedCustomerId: customerId },
      select: ['id'],
    });
    await Promise.all(
      receipts.map((v) => this.queueProducers.syncReceipt(v.id.toString())),
    );
  }

  async triggerSyncAllReceipts() {
    const receipts = await this.repository.find({
      where: {},
      select: ['id'],
    });
    await Promise.all(
      receipts.map((v) => this.queueProducers.syncReceipt(v.id.toString())),
    );
  }
}
