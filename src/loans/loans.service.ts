import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { ObjectId } from 'mongodb';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { Between, In, Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { PayloadException } from '../app.exceptions';
import { AppMessage } from '../app.message';
import { AppEntity, PageMetadata } from '../app.types';
import { CustomerFormsService } from '../customer-forms/customer-forms.service';
import { CustomerKycsService } from '../customer-kycs/customer-kycs.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseService } from '../database/database.service';
import { DatabaseName, TransactionNode } from '../database/database.types';
import {
  bindData,
  BulkUpdateWorkspaceBranchInput,
  detectWorkspaceBranchId,
  mustBeObjectId,
  RawObjectId,
  safeBindData,
  withPostgresQuery,
} from '../database/database.utils';
import {
  EventDataActionType,
  EventType,
  EventVariant,
} from '../events/events.types';
import { FilesService } from '../files/files.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { ReceiptsService } from '../receipts/receipts.service';
import { ReceiptStatus, ReceiptType } from '../receipts/receipts.types';
import { ExportReportByRangeTimeInput } from '../reports/reports.types';
import { isDiff } from '../utils/diff.utils';
import { round, roundValue } from '../utils/number.utils';
import { wait } from '../utils/wait.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { LoanEntity } from './entities/loan.entity';
import {
  LoanAssetEstimations,
  LoanEventData,
  LoanLiquidationCalculated,
  LoanMetadata,
  LoanPackage,
  LoanPackageType,
  LoanPaymentPeriod,
  LoanPaymentPlanResult,
  LoanPaymentPlanResultPaymentPeriod,
  LoanReceiptData,
  LoansMetricsReport,
  LoanStatus,
  LoansTimeSeriesReport,
} from './loans.types';

import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/notifications.types';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';
import { CustomerShortInfo } from '../customers/customers.types';
import { normalizeFileResponse } from '../files/files.utils';
import { AppLocale } from '../lang/lang.types';
import { translate } from '../lang/lang.utils';
import { getReportTimeRange } from '../reports/reports.utils';
import { DateTime } from '../utils/date-time';
import { hasPermission } from '../workspace-members/workspace-members.utils';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  BulkArchiveLoansInput,
  BulkRejectLoanInput,
  CreateLoanInput,
  FulfillLoanInput,
  ImportLoanInput,
  RejectLoanInput,
  SignLoanInput,
  UpdateLoanAmountInput,
  UpdateLoanAssetDataInput,
  UpdateLoanPackageInput,
} from './loans.inputs';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity, DatabaseName.POSTGRES)
    private readonly repository: Repository<LoanEntity>,
    private readonly customerKycs: CustomerKycsService,
    private readonly customers: CustomersService,
    private readonly workspaceSettings: WorkspaceSettingsService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly notifications: NotificationsService,
    @Inject(forwardRef(() => ReceiptsService))
    private readonly receipts: ReceiptsService,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspaces: WorkspacesService,
    @Inject(forwardRef(() => WorkspaceBranchesService))
    private readonly workspaceBranches: WorkspaceBranchesService,
    @Inject(forwardRef(() => CustomerFormsService))
    private readonly customerForms: CustomerFormsService,
    private readonly database: DatabaseService,
    private readonly files: FilesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async list(
    args: WithWorkspaceArgs<{ query?: any; select?: (keyof LoanEntity)[] }>,
  ) {
    const data = await this.repository.findAndCount(
      withPostgresQuery({
        ...args,
        filterFields: [
          '_id',
          'customerId',
          'customerCidNumber',
          'status',
          'assetType',
          'code',
          'packageId',
          'fulfilledAt',
          'isLiquidated',
          'isHasLateInterestReceipt',
        ],
        sortFields: ['nextReceiptAt', 'fulfilledAt'],
        filterRangeFields: ['nextReceiptAt', 'fulfilledAt'],
        filterTimeRangeFields: ['fulfilledAt'],
        select: args.select,
        allowGetAll: true,
      }),
    );

    return {
      count: data[1],
      data: data[0],
    };
  }

  async getNextCode(args: {
    entity: LoanEntity;
    workspace: WorkspaceEntity;
    node: TransactionNode;
    createdAt?: number;
    addon?: number;
  }) {
    const { entity, workspace, node, addon = 0, createdAt } = args;

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const now = DateTime.normalizeDate(createdAt ?? new Date());
        const monthRange = DateTime.getRange(now, 'month');

        const year = now.getFullYear().toString().slice(2);
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const prefix = `${year}${month}`;

        const count = await ctx.manager.count(LoanEntity, {
          where: {
            id: Not(entity.id),
            workspaceId: workspace._id.toString(),
            createdAt: Between(
              DateTime.toSeconds(monthRange.start),
              DateTime.toSeconds(monthRange.end),
            ),
          },
          order: { _count: -1 },
        });
        entity.code = `${workspace.code}${prefix}${count + 1 + addon}`;
        return entity;
      },
    });
  }

  async getContractPath(loan: LoanEntity) {
    if (!existsSync(`public/loans/${loan.code}`))
      mkdirSync(`public/loans/${loan.code}`, { recursive: true });
    return `public/loans/${loan.code}/HD-${loan.code}.pdf`;
  }

  getReceiptPeriod(receipt: ReceiptEntity) {
    const data = receipt.data as LoanReceiptData;

    if (data) {
      if (data.period && data.period.period) return data.period.period;
      if (data.lateInterest && data.lateInterest.period)
        return data.lateInterest.period;
      if (data.liquidation) return 100;
    }

    return 0;
  }

  async getSignaturePath(loan: LoanEntity) {
    if (!loan.signature) return null;
    return this.files
      .get({ fileId: loan.signature.split('.')[0] })
      .then(normalizeFileResponse)
      .then((res) => res.url)
      .catch(() => null);
  }

  async bindData(entity: LoanEntity, locale?: AppLocale) {
    return bindData<
      {
        _id: string;
        workspaceBranch?: Pick<WorkspaceBranchEntity, 'name' | '_id'>;
        contractUrl: string;
        disbursementReceiptRef: string;
        signatureUrl: string | null;
        rejectReason: string | null;
        loanTime: {
          from: number;
          to: number;
          fixed: boolean;
        } | null;
        customer: CustomerShortInfo | null;
      },
      LoanEntity
    >({
      entity,
      extends: {
        _id: (data) => (data._id ? data._id.toString() : data.id.toString()),
        workspaceBranch: safeBindData({
          entity,
          field: 'workspaceBranchId',
          fetch: () =>
            this.workspaceBranches.getWithCache({
              _id: entity.workspaceBranchId,
              workspaceId: entity.workspaceId,
            }),
        }),
        customer: safeBindData({
          entity,
          field: 'customerId',
          fetch: () =>
            this.customers.getShortInfo({
              id: entity.customerId,
              workspaceId: entity.workspaceId,
            }),
        }),
        contractUrl: (data) => this.getContractPath(data),
        disbursementReceiptRef: (data) => this.getDisbursementReceiptRef(data),
        signatureUrl: (data) => this.getSignaturePath(data),
        rejectReason: (data) => translate(data.rejectReason, locale),
        loanTime: async (data) => {
          if (!data.paymentPeriods || data.paymentPeriods.length === 0) {
            try {
              const paymentPlan = await this.calculatePaymentPlan({
                amount: data.amount,
                loanPackage: data.package,
                startTime: DateTime.getNowInSeconds(),
              });

              const paymentPeriods = paymentPlan.paymentPeriods.find(
                (v) => v.periodDays === data.packagePeriodDays,
              )?.periods;

              return {
                from: DateTime.toSeconds(paymentPeriods[0].startTime),
                to: DateTime.toSeconds(
                  paymentPeriods[paymentPeriods.length - 1].endTime,
                ),
                fixed: false,
              };
            } catch (error) {
              return null;
            }
          }

          return {
            from: DateTime.toSeconds(data.paymentPeriods[0].startTime),
            to: DateTime.toSeconds(
              data.paymentPeriods[data.paymentPeriods.length - 1].endTime,
            ),
            fixed: true,
          };
        },
      },
    });
  }

  bindEventData(loan: LoanEntity): LoanEventData {
    return {
      id: loan.id,
      code: loan.code,
      amount: loan.amount,
    };
  }

  async create(
    args: WithWorkspaceArgs<{
      input: CreateLoanInput;
      code?: string;
      createdAt?: number;
      nextReceiptAt?: number;
      status?: LoanStatus;
      node?: TransactionNode;
      isRequireCustomerKyc?: boolean;
    }>,
  ) {
    const {
      input,
      node,
      isRequireCustomerKyc: isRequireCustomerKyc = true,
    } = args;
    const { workspace, member, workspaceId } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const customerKyc = await this.customerKycs
          .get(input.customerId)
          .catch(() => null);

        if (isRequireCustomerKyc && !customerKyc) {
          throw new BadRequestException(
            AppMessage.CUSTOMER_KYC_MUST_BE_PROVIDED,
          );
        }

        if (input.amount <= 0) {
          throw new PayloadException({
            amount: AppMessage.INVALID_LOAN_AMOUNT,
          });
        }

        const [customer, settings] = await Promise.all([
          this.customers.getShortInfo({
            id: input.customerId,
            workspaceId,
          }),
          this.workspaceSettings.get(workspaceId),
        ]);

        const loanPackage = settings.loanSettings?.loanPackages?.find(
          (p) => p.id.toString() === input.packageId,
        );

        if (!loanPackage || !loanPackage.assetTypes.includes(input.assetType)) {
          throw new BadRequestException(AppMessage.INVALID_LOAN_PACKAGE);
        }

        if (
          input.packagePeriodDays &&
          !loanPackage.periodDaysOptions.includes(input.packagePeriodDays)
        ) {
          throw new BadRequestException(
            AppMessage.LOAN_PACKAGE_INVALID_DAYS_PER_PERIOD,
          );
        }

        const loan = new LoanEntity();

        loan.id = uuid();
        loan.workspaceId = workspace._id.toString();

        loan.packageId = loanPackage.id;
        loan.package = loanPackage;
        loan.packagePeriodDays =
          input.packagePeriodDays || loanPackage.periodDaysOptions[0];

        loan.customerId = customer._id.toString();

        loan.amount = input.amount;

        loan.assetType = input.assetType;
        loan.assetData = input.assetData;

        loan.status = args.status || LoanStatus.PENDING_SIGN;
        loan.payment = input.payment;
        loan.coord = input.coord;

        loan.nextReceiptAt = args.nextReceiptAt;
        loan.source = input.source;

        if (!input.workspaceBranchId) {
          // Auto select workspace branch with customer form
          const customerForm = await this.customerForms
            .list({
              workspaceId: loan.workspaceId,
              query: {
                phone: customer.phone,
                limit: 1,
              },
            })
            .then((res) => res.data[0])
            .catch(() => null);

          if (customerForm)
            loan.workspaceBranchId = customerForm.workspaceBranchId;

          // Auto select workspace branch with previous loan
          if (
            !loan.workspaceBranchId &&
            settings.loanSettings?.isAutoSelectWorkspaceBranch
          ) {
            const previousLoan = await ctx.manager.findOne(LoanEntity, {
              where: { customerId: loan.customerId },
              order: { _count: 'DESC' },
            });

            if (previousLoan && previousLoan.workspaceBranchId) {
              loan.workspaceBranchId = previousLoan.workspaceBranchId;
            }
          }
        }

        // Manual select workspace branch
        else {
          loan.workspaceBranchId = detectWorkspaceBranchId({
            doc: loan,
            dto: input,
            ...args,
          });
        }

        const saveWithCode = async (retry: number) => {
          try {
            if (args.code) {
              loan.code = args.code;
            } else {
              await this.getNextCode({
                entity: loan,
                workspace,
                addon: retry,
                createdAt: args.createdAt,
                node: ctx.node,
              });
            }
            await ctx.manager.save(loan);
          } catch (error) {
            if (retry >= 100) {
              throw new BadRequestException(
                AppMessage.DATA_CANNOT_BY_CREATED_YET,
              );
            }

            await wait(100);
            return saveWithCode(retry + 1);
          }
        };

        await saveWithCode(0);
        return loan;
      },
      onCommitted: (loan) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_JUST_CREATED,
          actionType: EventDataActionType.CREATE,
          ref: loan.id,
          workspaceId: loan.workspaceId,
          userId: member?.userId,
          data: this.bindEventData(loan),
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          reportTimeRange: getReportTimeRange(loan.createdAt),
          persist: true,
        });
      },
    });
  }

  async sign(
    args: WithWorkspaceArgs<{
      id: string;
      input: SignLoanInput;
    }>,
  ) {
    const { id, input, member } = withWorkspaceArgs(args);

    const loan = await this.get({ id, member });

    if (loan.status !== LoanStatus.PENDING_SIGN) {
      throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);
    }

    loan.status = LoanStatus.PENDING;
    loan.signature = input.signature;

    await this.repository.save(loan);

    await this.queueProducers.captureEvent({
      type: EventType.LOANS_PENDING,
      actionType: EventDataActionType.UPDATE,
      ref: loan.id,
      userId: member?.userId,
      workspaceId: loan.workspaceId,
      data: this.bindEventData(loan),
      variant: EventVariant.INFO,
      reportTimeRange: getReportTimeRange(loan.updatedAt),
      relatedEntities: [
        { entity: AppEntity.LOANS, id: loan.id, index: true },
        { entity: AppEntity.CUSTOMERS, id: loan.customerId },
      ],
      persist: true,
    });

    return loan;
  }

  async import(member: WorkspaceMember, dto: ImportLoanInput) {
    return this.database.runTransaction({
      handler: async (ctx) => {
        const loan = await this.create({
          node: ctx.node,
          member,
          input: dto,
          code: dto.code,
          createdAt: dto.createdAt,
          status: dto.status,
          isRequireCustomerKyc: dto.isRequireCustomerKyc,
        });

        return loan;
      },
    });
  }

  async get(
    args: WithOptionalWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member } = withOptionalWorkspaceArgs(args);
    const { id, node } = args;

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const data = await ctx.manager.findOne(LoanEntity, {
          where: ObjectId.isValid(id)
            ? {
                _id: id,
              }
            : {
                id,
              },
        });

        if (!data) throw new NotFoundException();
        if (member) validateWorkspaceAccessable({ member, data });
        return data;
      },
    });
  }

  async getByCode(args: WithOptionalWorkspaceArgs<{ code: string }>) {
    const { member } = withOptionalWorkspaceArgs(args);
    const { code } = args;

    const data = await this.repository.findOne({ where: { code } });
    if (!data) throw new NotFoundException();

    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async updateAssetData(
    args: WithWorkspaceArgs<{
      id: string;
      input: UpdateLoanAssetDataInput;
    }>,
  ) {
    const { member, input } = withWorkspaceArgs(args);
    const loan = await this.get(args);

    loan.assetData = input.assetData;
    await this.repository.save(loan);

    this.queueProducers.captureEvent({
      type: EventType.LOANS_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: loan.workspaceId,
      ref: loan.id,
      data: this.bindEventData(loan),
      userId: member?.userId,
      variant: EventVariant.INFO,
      relatedEntities: [
        { entity: AppEntity.LOANS, id: loan.id, index: true },
        { entity: AppEntity.CUSTOMERS, id: loan.customerId },
      ],
      persist: true,
    });

    return loan;
  }

  async updatePackage(
    args: WithWorkspaceArgs<{ id: string; input: UpdateLoanPackageInput }>,
  ) {
    const { member } = withWorkspaceArgs(args);
    const { id, input } = args;

    const loan = await this.get({ id, member });

    if (loan.status !== LoanStatus.PENDING)
      throw new BadRequestException(AppMessage.LOAN_CANNOT_BE_UPDATED);

    const [wsSettings] = await Promise.all([
      this.workspaceSettings.get(member.workspaceId),
    ]);

    const loanPackage = wsSettings.loanSettings?.loanPackages?.find(
      (p) => p.id.toString() === input.packageId,
    );
    if (!loanPackage)
      throw new BadRequestException(AppMessage.LOAN_PACKAGE_NOT_FOUND);

    if (
      input.packagePeriodDays &&
      !loanPackage.periodDaysOptions.includes(input.packagePeriodDays)
    ) {
      throw new BadRequestException(
        AppMessage.LOAN_PACKAGE_INVALID_DAYS_PER_PERIOD,
      );
    }

    loan.packageId = loanPackage.id;
    loan.package = loanPackage;
    loan.packagePeriodDays =
      input.packagePeriodDays ||
      loan.packagePeriodDays ||
      loanPackage.periodDaysOptions[0];

    await this.repository.save(loan);

    this.queueProducers.captureEvent({
      type: EventType.LOANS_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: loan.id,
      workspaceId: loan.workspaceId,
      data: this.bindEventData(loan),
      userId: member?.userId,
      variant: EventVariant.INFO,
      persist: true,
      relatedEntities: [
        { entity: AppEntity.LOANS, id: loan.id, index: true },
        { entity: AppEntity.CUSTOMERS, id: loan.customerId },
      ],
    });

    return loan;
  }

  async updateAmount(
    args: WithWorkspaceArgs<{ id: string; input: UpdateLoanAmountInput }>,
  ) {
    const { member, input } = withWorkspaceArgs(args);
    const loan = await this.get(args);
    if (loan.workspaceId !== member.workspaceId) throw new ForbiddenException();
    if (loan.status !== LoanStatus.PENDING)
      throw new BadRequestException(AppMessage.LOAN_CANNOT_BE_UPDATED);

    if (input.amount <= 0)
      throw new PayloadException({ amount: AppMessage.INVALID_LOAN_AMOUNT });
    loan.amount = input.amount;

    await this.repository.save(loan);

    this.queueProducers.captureEvent({
      type: EventType.LOANS_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: loan.id,
      workspaceId: loan.workspaceId,
      data: this.bindEventData(loan),
      userId: member?.userId,
      persist: true,
      variant: EventVariant.INFO,
      relatedEntities: [
        { entity: AppEntity.LOANS, id: loan.id, index: true },
        { entity: AppEntity.CUSTOMERS, id: loan.customerId },
      ],
    });

    return loan;
  }

  async approve(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const { id } = args;

    const loan = await this.get({ id, member });
    if (loan.workspaceId !== member.workspaceId) throw new ForbiddenException();
    if (loan.status !== LoanStatus.PENDING)
      throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);

    loan.status = LoanStatus.APPROVED;

    await this.repository.save(loan);

    this.queueProducers.captureEvent({
      type: EventType.LOANS_APPROVED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: loan.workspaceId,
      data: this.bindEventData(loan),
      userId: member?.userId,
      ref: loan.id,
      persist: true,
      variant: EventVariant.POSITIVE,
      relatedEntities: [
        { entity: AppEntity.LOANS, id: loan.id, index: true },
        { entity: AppEntity.CUSTOMERS, id: loan.customerId },
      ],
      reportTimeRange: getReportTimeRange(),
    });

    return loan;
  }

  async revertApprove(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const { id } = args;

    const loan = await this.get({ id, member });
    if (loan.workspaceId !== member.workspaceId) throw new ForbiddenException();
    if (loan.status !== LoanStatus.APPROVED)
      throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);

    loan.status = LoanStatus.PENDING;
    await this.repository.save(loan);

    this.queueProducers.captureEvent({
      type: EventType.LOANS_APPROVED_REVERTED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: loan.workspaceId,
      data: this.bindEventData(loan),
      persist: true,
      userId: member?.userId,
      ref: loan.id,
      variant: EventVariant.NEGATIVE,
    });

    return loan;
  }

  async revertFulfilled(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const { id } = args;

    return this.database.runTransaction({
      handler: async (ctx) => {
        const loan = await this.get({ id, member, node: ctx.node });

        const fulfilledReceipt = await this.receipts.getByRef(
          this.getDisbursementReceiptRef(loan),
          ctx.node,
        );

        if (!fulfilledReceipt) {
          throw new NotFoundException(AppMessage.RECEIPT_NOT_FOUND);
        }

        fulfilledReceipt.status = ReceiptStatus.PENDING;
        await ctx.save(fulfilledReceipt);

        loan.status = LoanStatus.APPROVED;
        await ctx.save(loan);
        return loan;
      },
      onCommitted: (loan) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_FULFILLED_REVERTED,
          actionType: EventDataActionType.UPDATE,
          workspaceId: loan.workspaceId,
          persist: true,
          data: this.bindEventData(loan),
          userId: member?.userId,
          ref: loan.id,
          variant: EventVariant.NEGATIVE,
        });
      },
    });
  }

  async reject(
    args: WithWorkspaceArgs<{
      id: string;
      input: RejectLoanInput;
      node?: TransactionNode;
    }>,
  ) {
    const { member } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const loan = await this.get({ ...args, node: ctx.node });

        if (loan.status !== LoanStatus.PENDING) {
          throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);
        }

        loan.status = LoanStatus.REJECTED;
        loan.rejectReason = args.input.reason;
        await ctx.save(loan);
        return loan;
      },
      onCommitted: (loan) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_REJECTED,
          actionType: EventDataActionType.UPDATE,
          workspaceId: loan.workspaceId,
          data: this.bindEventData(loan),
          persist: true,
          userId: member?.userId,
          ref: loan.id,
          variant: EventVariant.NEGATIVE,
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          reportTimeRange: getReportTimeRange(),
        });
      },
    });
  }

  async bulkReject(args: WithWorkspaceArgs<{ input: BulkRejectLoanInput }>) {
    return this.database.runTransaction({
      handler: async (ctx) => {
        return Promise.all(
          args.input.loanIds.map(async (loanId) => {
            return this.reject({
              ...args,
              id: loanId,
              node: ctx.node,
              input: args.input,
            });
          }),
        );
      },
    });
  }

  async revertRejected(
    args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const loan = await this.get({ ...args, node: ctx.node });

        if (loan.status !== LoanStatus.REJECTED) {
          throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);
        }

        loan.status = LoanStatus.PENDING;
        await ctx.save(loan);
        return loan;
      },
      onCommitted: (loan) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_REVERT_REJECTED,
          actionType: EventDataActionType.UPDATE,
          workspaceId: loan.workspaceId,
          data: this.bindEventData(loan),
          userId: member?.userId,
          persist: true,
          ref: loan.id,
          variant: EventVariant.POSITIVE,
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          reportTimeRange: getReportTimeRange(),
        });
      },
    });
  }

  async bulkRevertRejected(args: WithWorkspaceArgs<{ loanIds: string[] }>) {
    return this.database.runTransaction({
      handler: async (ctx) => {
        return Promise.all(
          args.loanIds.map(async (loanId) => {
            return this.revertRejected({ ...args, id: loanId, node: ctx.node });
          }),
        );
      },
    });
  }

  getDisbursementReceiptRef(loan: LoanEntity) {
    return `loan-disbursement-${loan._id || loan.id}`;
  }

  async fulfill(
    args: WithWorkspaceArgs<{
      input: FulfillLoanInput;
      id: string;
    }>,
  ) {
    const { member, input, id } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      handler: async (ctx) => {
        const loan = await this.get({ id, member, node: ctx.node });
        validateWorkspaceAccessable({ data: loan, member });

        // Invalid status
        if (loan.status !== LoanStatus.APPROVED) {
          throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS, {
            cause: { id: loan.id, status: loan.status },
          });
        }

        // Create disbursement receipt
        const disbursementReceipt = await this.receipts.getOrCreateByRef({
          node: ctx.node,
          member,
          ref: this.getDisbursementReceiptRef(loan),
          status: ReceiptStatus.PAID,
          paymentMethod: input.paymentMethod,
          paidAt: input.fulfilledAt,
          dto: {
            amount: loan.amount,
            type: ReceiptType.EXPENSE,
            relatedLoanId: loan.id,
            relatedCustomerId: loan.customerId,
          },
        });

        if (disbursementReceipt.status !== ReceiptStatus.PAID) {
          disbursementReceipt.status = ReceiptStatus.PAID;
          await ctx.save(disbursementReceipt);
        }

        // Add invoice file to receipt
        await Promise.all(
          input.receiptFileIds.map(async (fileId) => {
            const file = await this.files.get({ fileId });
            if (!file) throw new NotFoundException(AppMessage.FILE_NOT_FOUND);

            await this.files.addRelatedEntities({
              id: file._id.toString(),
              relatedEntities: [
                { entity: AppEntity.RECEIPTS, id: disbursementReceipt.id },
                { entity: AppEntity.LOANS, id: loan.id, index: true },
              ],
            });
          }),
        );

        // Default fulfilled at
        loan.fulfilledAt = DateTime.getNowInSeconds();

        // Custom fulfilled at
        if (
          input.fulfilledAt &&
          hasPermission(member, WorkspacePermission.LOANS_CUSTOM_FULFILLED_AT)
        ) {
          loan.fulfilledAt = input.fulfilledAt;
        }

        // Calculate payment plan
        const paymentPlan = await this.calculatePaymentPlan({
          amount: loan.amount,
          loanPackage: loan.package,
          startTime: loan.fulfilledAt,
        });

        // Get payment periods
        const paymentPeriods = paymentPlan.paymentPeriods.find(
          (v) => v.periodDays === loan.packagePeriodDays,
        )?.periods;

        if (!paymentPeriods) {
          throw new BadRequestException(
            AppMessage.LOAN_PACKAGE_INVALID_DAYS_PER_PERIOD,
          );
        }

        loan.status = LoanStatus.FULFILLED;
        loan.paymentPeriods = paymentPeriods;
        await ctx.save(loan);

        // Create payment receipts
        for (let paymentPeriod of loan.paymentPeriods) {
          const receiptData: LoanReceiptData = { period: paymentPeriod };
          const expireAt = DateTime.toSeconds(
            DateTime.getRange(paymentPeriod.endTime, 'day').end,
          );
          const periodRef = `loan-payment-${loan._id || loan.id}-${paymentPeriod.period}`;

          const existed = await this.receipts
            .getByRef(periodRef, ctx.node)
            .catch(() => null);

          if (existed) continue;

          await this.receipts.create({
            node: ctx.node,
            workspace: member.workspace,
            input: {
              workspaceBranchId: loan.workspaceBranchId,
              amount: paymentPeriod.totalAmount,
              type: ReceiptType.INCOME,
              ref: periodRef,
              relatedLoanId: loan.id,
              relatedCustomerId: loan.customerId,
              expireAt,
              data: receiptData,
            },
            member,
          });
        }

        return loan;
      },
      onCommitted: (loan) => {
        this.queueProducers.captureEvent({
          ref: loan.id,
          type: EventType.LOANS_FULFILLED,
          actionType: EventDataActionType.UPDATE,
          workspaceId: loan.workspaceId,
          data: this.bindEventData(loan),
          persist: true,
          userId: member?.userId,
          variant: EventVariant.POSITIVE,
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          reportTimeRange: getReportTimeRange(loan.fulfilledAt),
        });
      },
    });
  }

  getLiquidationReceiptRef(loan: LoanEntity) {
    return `loan-payment-${loan._id || loan.id}-liquidation`;
  }

  async liquidateCalculate(
    args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member, id, node } = withWorkspaceArgs(args);
    const [loan, settings] = await Promise.all([
      this.get({ id, node, member }),
      this.workspaceSettings.get(member.workspaceId),
    ]);

    const currentPackage = settings.loanSettings?.loanPackages?.find(
      (v) => v.id === loan.package.id,
    );

    if (loan.workspaceId !== member.workspaceId) throw new ForbiddenException();

    if (![LoanStatus.FULFILLED, LoanStatus.OVERDUE].includes(loan.status)) {
      throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);
    }

    const now = DateTime.getNowInSeconds();

    // Số tiền gốc
    let capitalAmount = 0;

    // Số tiền tạm ứng
    let avancedPaymentAmount = 0;

    // Lãi tính từ kỳ chưa thanh toán đến nay
    let period = 0;
    let periodFeeAmount = 0;
    let periodFeeDays = 0;
    let periodStartAt = 0;
    let periodFeePerDay = 0;

    // Lãi quá hạn
    let lateInterestAmount = 0;

    // Disbursement receipts
    const disbursementReceipt = await this.receipts.list<LoanReceiptData>({
      query: {
        ref: this.getDisbursementReceiptRef(loan),
        getAll: true,
      },
      workspaceId: member.workspaceId,
    });

    disbursementReceipt.results.forEach((v) => {
      capitalAmount += Math.abs(v.amount);
    });

    // Payment receipts
    const paymentReceipts = await this.receipts.list<LoanReceiptData>({
      query: {
        relatedLoanId: loan.id,
        type: ReceiptType.INCOME,
        getAll: true,
      },
      workspaceId: member.workspaceId,
    });

    const _paymentReceipts = [...paymentReceipts.results]
      .filter((v) => v.amount > 0)
      .sort((a, b) => a.data?.period?.period - b.data?.period?.period);

    const isLiquidated = _paymentReceipts.some(
      (v) => v.data?.liquidation || (v.ref && v.ref.includes('liquidation')),
    );
    if (isLiquidated)
      throw new BadRequestException(AppMessage.LOAN_WAS_LIQUIDATED);

    for (let receipt of _paymentReceipts) {
      const data = receipt.data as LoanReceiptData;
      if (!data) continue;

      // Paid receipts
      if (receipt.status === ReceiptStatus.PAID) {
        const relatedPaymentPeriod = loan.paymentPeriods.find(
          (v) => v.period === data?.period?.period,
        );
        const paymentPeriodRate = relatedPaymentPeriod
          ? receipt.amount / relatedPaymentPeriod.totalAmount
          : 1;

        const getCapital = () => {
          if (data.liquidationCalculated) {
            return data.liquidationCalculated.remainCapitalAmount || 0;
          }

          return (data.period?.capitalAmount || 0) * paymentPeriodRate;
        };

        const capital = getCapital();
        avancedPaymentAmount += round(capital, 2);

        continue;
      }

      // Remain pending receipts

      // Late interest
      if (data.lateInterest) {
        lateInterestAmount += receipt.amount;

        // Check period
      } else if (data.period && periodStartAt === 0) {
        const startPeriodAt =
          receipt.expireAt - loan.packagePeriodDays * 24 * 60 * 60;
        periodFeeDays = Math.ceil((now - startPeriodAt) / (24 * 60 * 60));
        if (periodFeeDays > 0) {
          period = data.period.period;
          periodStartAt = startPeriodAt;
          periodFeePerDay = data.period.fee / loan.packagePeriodDays;
          periodFeeAmount =
            data.period.fee * (periodFeeDays / loan.packagePeriodDays);
        }
      }
    }

    const remainCapitalAmount = roundValue(
      capitalAmount - avancedPaymentAmount,
      2,
    );

    let remainCapitalAmountFeePercent = currentPackage?.liquidationFeeRate || 0;
    let remainCapitalAmountFee =
      remainCapitalAmount * (remainCapitalAmountFeePercent / 100);

    const isLastPeriod =
      _paymentReceipts.filter((v) => v.status === ReceiptStatus.PENDING)
        .length === 1;

    // Đối với trả góp nếu thanh lý trước kỳ cuối cùng & hợp đồng không bị quá hạn thì không tính lãi
    // -> Bỏ điều kiện quá hạn (27/12/2024)
    if (loan.package.type === LoanPackageType.INSTALLMENT && !isLastPeriod) {
      periodFeeAmount = 0;
      remainCapitalAmountFee = 0;
      remainCapitalAmountFeePercent = 0;
    }

    const feeAmount =
      remainCapitalAmount +
      remainCapitalAmountFee +
      periodFeeAmount +
      lateInterestAmount;

    const paidAmount = _paymentReceipts
      .filter((v) => v.status === ReceiptStatus.PAID)
      .reduce((total, receipt) => total + receipt.amount, 0);

    const calculated: LoanLiquidationCalculated = {
      capitalAmount,
      paidAmount,
      avancedPaymentAmount,
      remainCapitalAmountFee,
      remainCapitalAmountFeePercent,
      remainCapitalAmount,
      period,
      periodStartAt,
      periodFeeAmount,
      periodFeeDays,
      periodFeePerDay,
      feeAmount,
      lateInterestAmount,
    };

    return {
      calculated,
      loan,
      receipts: _paymentReceipts,
    };
  }

  async liquidate(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      handler: async (ctx) => {
        const { loan, calculated, receipts } = await this.liquidateCalculate({
          member,
          id,
          node: ctx.node,
        });

        const pendingReceipts = receipts.filter(
          (v) => v.status === ReceiptStatus.PENDING,
        );

        const receiptData: LoanReceiptData = {
          liquidation: true,
          liquidationCalculated: calculated,
          liquidationReceiptIds: pendingReceipts.map((v) => v.id),
        };

        const { end } = DateTime.getRange(new Date(), 'day');

        const expireAt = DateTime.toSeconds(end);

        let liquidationReceipt = await ctx.manager.findOne(ReceiptEntity, {
          where: {
            ref: this.getLiquidationReceiptRef(loan),
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (liquidationReceipt) {
          liquidationReceipt.amount = calculated.feeAmount;
          liquidationReceipt.data = receiptData;
          liquidationReceipt.expireAt = expireAt;
          liquidationReceipt.isArchived = false;
          liquidationReceipt.createdAt = DateTime.getNowInSeconds();
          liquidationReceipt.updatedAt = DateTime.getNowInSeconds();
          liquidationReceipt.workspaceBranchId = loan.workspaceBranchId;
          await ctx.manager.save(liquidationReceipt);
        } else {
          // Create liquidation receipt
          liquidationReceipt = await this.receipts.create({
            input: {
              amount: calculated.feeAmount,
              type: ReceiptType.INCOME,
              ref: this.getLiquidationReceiptRef(loan),
              relatedLoanId: loan.id,
              relatedCustomerId: loan.customerId,
              expireAt,
              data: receiptData,
              workspaceBranchId: loan.workspaceBranchId,
            },
            workspace: member.workspace,
            node: ctx.node,
          });
        }

        // Archive all pending receipts
        await Promise.all(
          pendingReceipts.map((v) => {
            return this.receipts.archive({
              id: v.id,
              node: ctx.node,
              member,
            });
          }),
        );

        return { liquidationReceipt, loan, calculated };
      },
      onCommitted: ({ loan, calculated }) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_LIQUIDATION,
          actionType: EventDataActionType.UPDATE,
          ref: loan.id,
          variant: EventVariant.INFO,
          workspaceId: loan.workspaceId,
          data: { ...this.bindEventData(loan), calculated },
          userId: member?.userId,
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          persist: !!member,
          reportTimeRange: {
            fromTime: loan.createdAt,
            toTime: DateTime.getNowInSeconds(),
          },
        });
      },
    });
  }

  async revertLiquidation(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      handler: async (ctx) => {
        const loan = await this.get({ id, member, node: ctx.node });

        const receiptRef = this.getLiquidationReceiptRef(loan);
        const liquidationReceipt: ReceiptEntity | undefined =
          await this.receipts
            .getByRef(receiptRef, ctx.node)
            .catch(() => undefined);
        if (!liquidationReceipt || liquidationReceipt.isArchived)
          throw new BadRequestException(AppMessage.LOAN_NOT_LIQUIDATED_YET);

        // Unarchive liquidation receipt
        const receiptData = liquidationReceipt.data as LoanReceiptData;
        if (
          !receiptData.liquidationReceiptIds ||
          liquidationReceipt.status === ReceiptStatus.PAID
        ) {
          throw new BadRequestException(AppMessage.LOAN_NOT_LIQUIDATED_YET);
        }

        // Archive liquidation receipt
        await this.receipts.archive({
          member,
          id: liquidationReceipt.id,
          node: ctx.node,
        });

        // Unarchive all pending receipts
        await Promise.all(
          receiptData.liquidationReceiptIds.map((v) =>
            this.receipts.unarchive({
              id: v,
              node: ctx.node,
            }),
          ),
        );

        return { liquidationReceipt, loan };
      },
      onCommitted: ({ loan }) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_REVERT_LIQUIDATION,
          actionType: EventDataActionType.UPDATE,
          ref: loan.id,
          variant: EventVariant.INFO,
          workspaceId: loan.workspaceId,
          data: this.bindEventData(loan),
          userId: member?.userId,
          persist: true,
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          reportTimeRange: {
            fromTime: loan.createdAt,
            toTime: DateTime.getNowInSeconds(),
          },
        });
      },
    });
  }

  async archive(
    args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member } = withWorkspaceArgs(args);
    const { id, node } = args;

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const loan = await this.get({ id, member, node: ctx.node });

        if (
          ![LoanStatus.PENDING, LoanStatus.PENDING_SIGN].includes(loan.status)
        ) {
          throw new BadRequestException(AppMessage.INVALID_LOAN_STATUS);
        }

        loan.isArchived = true;
        await ctx.manager.save(loan);
        return loan;
      },
      onCommitted: (loan) => {
        this.queueProducers.captureEvent({
          type: EventType.LOANS_ARCHIVED,
          actionType: EventDataActionType.ARCHIVED,
          ref: loan.id,
          variant: EventVariant.NEGATIVE,
          workspaceId: loan.workspaceId,
          data: this.bindEventData(loan),
          persist: true,
          userId: member?.userId,
          relatedEntities: [
            { entity: AppEntity.LOANS, id: loan.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: loan.customerId },
          ],
          reportTimeRange: {
            fromTime: loan.createdAt,
            toTime: DateTime.getNowInSeconds(),
          },
        });
      },
    });
  }

  async bulkArchive(args: WithWorkspaceArgs<{ input: BulkArchiveLoansInput }>) {
    const { input, member } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      handler: async (ctx) => {
        await Promise.all(
          input.loanIds.map((v) =>
            this.archive({
              ...args,
              id: v,
              node: ctx.node,
              member,
            }),
          ),
        );

        return input.loanIds;
      },
    });
  }

  async updateWorkspaceBranch(args: {
    member: WorkspaceMember;
    loanId: string;
    workspaceBranchId: string | null;
    node?: TransactionNode;
  }) {
    const { member, loanId, workspaceBranchId } = args;

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const loan = await this.get({
          node: ctx.node,
          id: loanId,
          member,
        });

        if (loan.workspaceBranchId === workspaceBranchId) return loan;

        // Update workspace branch
        loan.workspaceBranchId = workspaceBranchId || null;

        // Update related customer
        await this.customers.bulkUpdateWorkspaceBranch({
          member,
          input: {
            ids: [loan.customerId],
            workspaceBranchId,
          },
        });

        // Update related receipts
        const receipts = await ctx.manager.find(ReceiptEntity, {
          where: {
            relatedLoanId: loan.id,
          },
        });

        await Promise.all(
          receipts.map((v) => {
            return this.receipts.updateWorkspaceBranch({
              node: ctx.node,
              member,
              id: v.id,
              workspaceBranchId,
            });
          }),
        );

        await ctx.manager.save(loan);
        return loan;
      },
    });
  }

  async bulkUpdateWorkspaceBranch(
    args: WithWorkspaceArgs<{
      input: BulkUpdateWorkspaceBranchInput;
      node?: TransactionNode;
    }>,
  ) {
    const { member, workspaceId } = withWorkspaceArgs(args);
    const { input } = args;
    const { ids, workspaceBranchId } = input;

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        return Promise.all(
          ids.map((v) => {
            return this.updateWorkspaceBranch({
              node: ctx.node,
              member,
              loanId: v,
              workspaceBranchId,
            });
          }),
        );
      },
      onCommitted: () =>
        this.queueProducers.captureEvent({
          workspaceId,
          userId: member?.userId,
          type: EventType.LOANS_CHANGE_WORKSPACE_BRANCH,
          actionType: EventDataActionType.UPDATE,
          variant: EventVariant.INFO,
          persist: true,
          data: { loanIds: ids, workspaceBranchId },
          relatedEntities: [
            ...ids.map((v) => ({
              entity: AppEntity.LOANS,
              id: v,
              index: true,
            })),
          ],
        }),
    });
  }

  async getLoanPackages(workspace: WorkspaceEntity) {
    const settings = await this.workspaceSettings.get(workspace._id.toString());
    return settings.loanSettings?.loanPackages || [];
  }

  async calculatePaymentPlan(args: {
    amount: number;
    loanPackage: LoanPackage;
    startTime?: number;
  }): Promise<LoanPaymentPlanResult> {
    const oneDay = 24 * 60 * 60;
    const { loanPackage } = args;

    const startTime = DateTime.toSeconds(
      DateTime.getRange(
        args.startTime ? args.startTime * 1000 : Date.now(),
        'day',
      ).end,
    );

    const getFee = (amount: number, date = 30) =>
      (amount * loanPackage.contractFee * date) / 1e6;

    const getPaymentPeriods = (
      amount: number,
      periods: number,
      periodDays: number,
    ) => {
      let paymentPeriods: LoanPaymentPeriod[] = [];
      let remainCapitalAmount = amount;

      if (loanPackage.type === LoanPackageType.INSTALLMENT) {
        const fee = getFee(amount, loanPackage.days);
        paymentPeriods.push({
          period: 0,
          startTime,
          endTime: DateTime.toSeconds(
            DateTime.getRange(startTime * 1000, 'day').end,
          ),
          fee,
          totalAmount: fee,
          capitalAmount: 0,
          remainCapitalAmount,
        });
      }

      for (let i = 1; i <= periods; i++) {
        const capitalAmount = round(amount / periods);
        const startPeriodTime = DateTime.getRange(
          (startTime + (i - 1) * periodDays * 24 * 60 * 60) * 1000,
          'day',
        ).start;

        const endPeriodTime = DateTime.getRange(
          (startTime + i * periodDays * 24 * 60 * 60) * 1000,
          'day',
        ).end;

        if (loanPackage.type === LoanPackageType.INSTALLMENT) {
          remainCapitalAmount = remainCapitalAmount - capitalAmount;
          paymentPeriods.push({
            period: i,
            startTime: DateTime.toSeconds(startPeriodTime),
            endTime: DateTime.toSeconds(endPeriodTime) - oneDay,
            fee: 0,
            capitalAmount,
            totalAmount: capitalAmount,
            remainCapitalAmount,
          });
        }

        if (loanPackage.type === LoanPackageType.FIXED_CAPITAL) {
          const fee = round(getFee(capitalAmount));
          remainCapitalAmount = remainCapitalAmount - capitalAmount;
          paymentPeriods.push({
            period: i,
            startTime: DateTime.toSeconds(startPeriodTime),
            endTime: DateTime.toSeconds(endPeriodTime) - oneDay,
            fee: fee,
            capitalAmount,
            totalAmount: capitalAmount + fee,
            remainCapitalAmount,
          });
        }

        if (loanPackage.type === LoanPackageType.UNFIXED_CAPITAL) {
          const periodIndex = loanPackage.periodDaysOptions.indexOf(periodDays);
          const capitalAmount = round(
            (amount * loanPackage.unFixedCapitalRates[periodIndex][i - 1]) /
              100,
          );

          const fee = round(getFee(remainCapitalAmount));

          remainCapitalAmount = remainCapitalAmount - capitalAmount;
          paymentPeriods.push({
            period: i,
            startTime: DateTime.toSeconds(startPeriodTime),
            endTime: DateTime.toSeconds(endPeriodTime) - oneDay,
            fee: fee,
            capitalAmount: capitalAmount,
            totalAmount: capitalAmount + fee,
            remainCapitalAmount,
          });
        }
      }

      if (loanPackage.type === LoanPackageType.UNFIXED_CAPITAL) {
        const totalAmount = paymentPeriods.reduce(
          (total, period) => total + period.totalAmount,
          0,
        );

        paymentPeriods = paymentPeriods.map((p) => {
          return {
            ...p,
            totalAmount: round(totalAmount / periods),
          };
        });
      }

      if (
        remainCapitalAmount > 0 &&
        paymentPeriods[paymentPeriods.length - 2]
      ) {
        paymentPeriods[paymentPeriods.length - 2].remainCapitalAmount +=
          remainCapitalAmount;
        remainCapitalAmount = 0;
      }

      paymentPeriods = paymentPeriods.map((p, i) => {
        const isLastPeriod = i === paymentPeriods.length - 1;
        return {
          ...p,
          remainCapitalAmount: isLastPeriod
            ? 0
            : p.remainCapitalAmount >= 0
              ? p.remainCapitalAmount
              : 0,
        };
      });

      return paymentPeriods;
    };

    const paymentPeriods = loanPackage.periodDaysOptions.reduce(
      (output, periodDays) => {
        const periods = Math.ceil(loanPackage.days / periodDays);
        output.push({
          periodDays,
          periods: getPaymentPeriods(args.amount, periods, periodDays),
        });
        return output;
      },
      [] as LoanPaymentPlanResultPaymentPeriod[],
    );

    return {
      paymentPeriods,
      loanPackage,
    };
  }

  loanAssetEstimationPath = 'public/loan-asset-estimations';
  async setAssetEstimations(workspaceId: string, data: any) {
    if (!existsSync(this.loanAssetEstimationPath)) {
      mkdirSync(this.loanAssetEstimationPath, { recursive: true });
    }

    await writeFile(
      `${this.loanAssetEstimationPath}/${workspaceId}.json`,
      JSON.stringify(data),
      'utf-8',
    );

    return this.getAssetEstimations(workspaceId);
  }

  async getAssetEstimations(
    workspaceId: string,
  ): Promise<LoanAssetEstimations> {
    const path = `${this.loanAssetEstimationPath}/${workspaceId}.json`;
    if (!existsSync(path)) {
      return {
        id: workspaceId,
        brands: [],
        models: [],
        colors: [],
        estimations: [],
      };
    }

    const data = await readFile(path, 'utf-8');
    const parsedData = JSON.parse(data);

    return {
      id: workspaceId,
      ...parsedData,
    };
  }

  async getMetadata(code: string): Promise<PageMetadata> {
    const loan = await this.getByCode({ code });
    return {
      title: `Hồ sơ vay ${loan.code}`,
      description: `Hồ sơ vay ${loan.code}`,
    };
  }

  async timeSeriesReport(input: ExportReportByRangeTimeInput) {
    const baseQuery = {
      workspaceId: input.workspaceId,
      workspaceBranchIds: input.workspaceBranchIds,
    };

    const [newLoans, fulfilledLoans] = await Promise.all([
      this.list({
        ...baseQuery,
        select: ['id', 'amount', 'customerId'],
        query: {
          status: [
            LoanStatus.FULFILLED,
            LoanStatus.APPROVED,
            LoanStatus.COMPLETED,
          ],
          rangeCreatedAt: `${input.fromTime}-${input.toTime}`,
          workspaceBranchIds: input.workspaceBranchIds,
          getAll: true,
        },
      }),
      this.list({
        ...baseQuery,
        select: ['id', 'amount', 'customerId'],
        query: {
          status: [
            LoanStatus.FULFILLED,
            LoanStatus.APPROVED,
            LoanStatus.COMPLETED,
            LoanStatus.OVERDUE,
          ],
          rangeFulfilledAt: `${input.fromTime}-${input.toTime}`,
          workspaceBranchIds: input.workspaceBranchIds,
          getAll: true,
        },
      }),
    ]);

    const report: LoansTimeSeriesReport = {
      newLoans: newLoans.data.map((loan) => ({
        id: loan.id,
        amount: loan.amount,
        customerId: loan.customerId,
      })),
      fulfilledLoans: fulfilledLoans.data.map((loan) => ({
        id: loan.id,
        amount: loan.amount,
        customerId: loan.customerId,
      })),
      contracts: {
        new: newLoans.count,
        fulfilled: fulfilledLoans.count,
        fulfilledAmount: fulfilledLoans.data.reduce((total, loan) => {
          return total + loan.amount;
        }, 0),
      },
    };

    return report;
  }

  async metricsReport(member: WorkspaceMember) {
    const [loans] = await Promise.all([
      this.list({
        member,
        query: {
          status: [
            LoanStatus.FULFILLED,
            LoanStatus.OVERDUE,
            LoanStatus.PENDING,
            LoanStatus.PENDING_SIGN,
            LoanStatus.APPROVED,
          ],
          getAll: true,
        },
        select: ['status', 'amount', 'id'],
      }),
    ]);

    const report: LoansMetricsReport = {
      contracts: {
        activated: loans.data.filter((v) => v.status === LoanStatus.FULFILLED)
          .length,
        overdue: loans.data.filter((v) => v.status === LoanStatus.OVERDUE)
          .length,
        pending: loans.data.filter((v) =>
          [
            LoanStatus.PENDING,
            LoanStatus.PENDING_SIGN,
            LoanStatus.APPROVED,
          ].includes(v.status),
        ).length,
      },
      debt: {
        notDueYet: loans.data
          .filter((v) => v.status === LoanStatus.FULFILLED)
          .reduce((total, loan) => {
            return total + loan.amount;
          }, 0),
        overdue: loans.data
          .filter((v) => v.status === LoanStatus.OVERDUE)
          .reduce((total, loan) => {
            return total + loan.amount;
          }, 0),
        total: loans.data
          .filter((v) =>
            [LoanStatus.FULFILLED, LoanStatus.OVERDUE].includes(v.status),
          )
          .reduce((total, loan) => {
            return total + loan.amount;
          }, 0),
      },
    };

    return report;
  }

  async sync(id: string, forceSyncPaymentPeriods = false) {
    const loan = await this.get({ id });
    const [settings, receipts, workspace, customerKyc] = await Promise.all([
      this.workspaceSettings.get(loan.workspaceId),
      this.receipts.list<LoanReceiptData>({
        query: {
          relatedLoanId: id,
          getAll: true,
        },
        workspaceId: loan.workspaceId,
      }),
      this.workspaces.get(loan.workspaceId),
      this.customerKycs.get(loan.customerId),
    ]);

    const now = DateTime.getNowInSeconds();
    let isNeedUpdate = false;

    const allPaid =
      receipts.results.length > 0 &&
      receipts.results.every((v) => v.status === ReceiptStatus.PAID);

    // Metadata
    const kyc = customerKyc.versions[customerKyc.versions.length - 1];

    const metadata: LoanMetadata = {
      cidNumber: kyc?.cidNumber,
      cidVnLocation: kyc?.cidVnLocation,
      cidLocation: kyc?.cidLocation,
    };

    if (isDiff(loan.metadata, metadata)) {
      loan.metadata = metadata;
      isNeedUpdate = true;
    }

    if (metadata.cidNumber !== loan.customerCidNumber) {
      loan.customerCidNumber = metadata.cidNumber;
      isNeedUpdate = true;
    }

    // Check if loan is completed
    if (loan.status === LoanStatus.COMPLETED) {
      if (!allPaid) {
        loan.status = LoanStatus.FULFILLED;
        isNeedUpdate = true;
      }
    }

    // Check if loan is overdue
    if (loan.status === LoanStatus.OVERDUE) {
      const isOverDue = receipts.results.some((v) => {
        return (
          v.status === ReceiptStatus.PENDING && v.expireAt && v.expireAt < now
        );
      });

      if (!isOverDue) {
        loan.status = LoanStatus.FULFILLED;
        isNeedUpdate = true;
      }
    }

    // Check if loan is fulfilled (active)
    if (loan.status === LoanStatus.FULFILLED) {
      const isOverDue = receipts.results.some((v) => {
        return (
          v.status === ReceiptStatus.PENDING && v.expireAt && v.expireAt < now
        );
      });

      if (isOverDue) {
        loan.status = LoanStatus.OVERDUE;
        isNeedUpdate = true;
      }

      // All receipts are paid
      if (allPaid) {
        loan.status = LoanStatus.COMPLETED;
        isNeedUpdate = true;
      }
    }

    if ([LoanStatus.FULFILLED, LoanStatus.OVERDUE].includes(loan.status)) {
      const currentPackage = settings.loanSettings?.loanPackages?.find(
        (v) => v.id === loan.package.id,
      );

      // Check late payment
      for (let i = 0; i < receipts.results.length; i++) {
        const receipt = receipts.results[i];
        const data = receipt.data as LoanReceiptData;

        const expiredDays =
          receipt.status === ReceiptStatus.PENDING &&
          receipt.expireAt &&
          receipt.expireAt < now
            ? Math.ceil((now - receipt.expireAt) / (24 * 60 * 60))
            : 0;

        const lateInterestRates = (
          currentPackage?.lateInterestRates || []
        ).sort((a, b) => b.lateDays - a.lateDays);
        const lateInterestRate = lateInterestRates.find(
          (v) => expiredDays >= v.lateDays,
        );

        if (
          lateInterestRate &&
          lateInterestRate.rate > 0 &&
          data?.period?.period &&
          expiredDays > 0
        ) {
          const paymentPeriod = loan.paymentPeriods?.find(
            (v) => v.period === data.period.period,
          );
          if (!paymentPeriod) continue;

          const lateFeeAmount =
            (paymentPeriod.totalAmount * lateInterestRate.rate) / 100;
          const ref = `loan-late-payment-${loan._id || loan.id}-${data.period.period}`;
          const lateReceipt: ReceiptEntity | null = await this.receipts
            .getByRef(ref)
            .catch(() => null);

          if (lateReceipt && lateReceipt.status === ReceiptStatus.PAID)
            continue;

          const lateReceiptData: LoanReceiptData = {
            lateInterest: {
              days: expiredDays,
              period: data.period.period,
              rate: lateInterestRate.rate,
            },
          };

          const expireAt = DateTime.toSeconds(
            DateTime.getRange(receipt.expireAt * 1000, 'day').end,
          );

          // Create late payment receipt
          if (!lateReceipt) {
            await this.receipts.create({
              workspace: workspace,
              input: {
                amount: lateFeeAmount,
                type: ReceiptType.INCOME,
                data: lateReceiptData,
                relatedLoanId: loan.id,
                relatedCustomerId: loan.customerId,
                expireAt,
                ref,
              },
            });
          } else {
            // Update amount if needed
            if (
              lateReceipt.isFixedAmount !== true &&
              (lateFeeAmount !== lateReceipt.amount ||
                lateReceipt.expireAt !== expireAt ||
                (lateReceipt.data?.lateInterest &&
                  isDiff(
                    lateReceipt.data.lateInterest,
                    lateReceiptData.lateInterest,
                    ['days', 'period', 'rate'],
                  )))
            ) {
              await this.receipts.update({
                workspaceId: loan.workspaceId,
                id: lateReceipt.id,
                input: {
                  ...lateReceipt,
                  amount: lateFeeAmount,
                  expireAt,
                  data: lateReceiptData,
                },
              });
            }
          }

          isNeedUpdate = true;
        }
      }
    }

    // Liquidation
    const isLiquidated = receipts.results.some((v) => v.data?.liquidation);
    if (isLiquidated !== loan.isLiquidated) {
      loan.isLiquidated = isLiquidated;
      isNeedUpdate = true;
    }

    // Payment progress
    const paymentProgress = receipts.results
      .filter((v) => v.type === ReceiptType.INCOME)
      .map((v) => ({
        receiptId: v.id,
        amount: v.amount,
        time: v.expireAt,
        isCompleted: v.status === ReceiptStatus.PAID,
      }))
      .sort((a, b) => a.time - b.time);

    if (
      !loan.paymentProgress ||
      isDiff(loan.paymentProgress, paymentProgress)
    ) {
      loan.paymentProgress = paymentProgress;
      isNeedUpdate = true;
    }

    // Sync next receipt at
    const nextReceipt = receipts.results
      .filter(
        (v) =>
          v.type === ReceiptType.INCOME &&
          v.status === ReceiptStatus.PENDING &&
          !!v.expireAt,
      )
      .sort((a, b) => a.expireAt - b.expireAt)[0];

    if (nextReceipt && nextReceipt.expireAt !== loan.nextReceiptAt) {
      loan.nextReceiptAt = nextReceipt.expireAt;
      isNeedUpdate = true;
    }

    // Has late interest receipt
    const isHasLateInterestReceipt = receipts.results.some(
      (v) => v.data?.lateInterest,
    );
    if (isHasLateInterestReceipt !== loan.isHasLateInterestReceipt) {
      loan.isHasLateInterestReceipt = isHasLateInterestReceipt;
      isNeedUpdate = true;
    }

    if (
      !loan.paymentPeriods ||
      loan.paymentPeriods.some((v) => !v.endTime) ||
      forceSyncPaymentPeriods
    ) {
      const archivedReceipts = await this.receipts.list<LoanReceiptData>({
        query: { relatedLoanId: loan.id, getAll: true, isArchived: true },
        workspaceId: workspace._id.toString(),
      });

      const firstReceipt = [
        ...receipts.results,
        ...archivedReceipts.results.filter((v) => v.isArchived),
      ]
        .filter(
          (v) =>
            v.type === ReceiptType.INCOME &&
            v.data?.period &&
            v.data.period.period === 1,
        )
        .sort((a, b) => a.createdAt - b.createdAt)[0];

      if (firstReceipt) {
        const calculated = await this.calculatePaymentPlan({
          amount: loan.amount,
          loanPackage: loan.package,
          startTime: loan.fulfilledAt || firstReceipt.createdAt * 1000,
        });

        loan.paymentPeriods = calculated.paymentPeriods.find(
          (v) => v.periodDays === loan.packagePeriodDays,
        )?.periods;
        isNeedUpdate = true;
      }
    }

    // Sync loan workspace branch to receipts
    await Promise.all(
      receipts.results.map((receipt) => {
        if (receipt.workspaceBranchId !== loan.workspaceBranchId) {
          return this.receipts.updateWorkspaceBranch({
            id: receipt.id,
            workspaceBranchId: loan.workspaceBranchId ?? null,
          });
        }
      }),
    );

    if (isNeedUpdate) {
      await this.repository.save(loan);
      this.queueProducers.captureEvent({
        type: EventType.LOANS_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: loan.workspaceId,
        data: this.bindEventData(loan),
        ref: loan.id,
        relatedEntities: [
          { entity: AppEntity.LOANS, id: loan.id, index: true },
          { entity: AppEntity.CUSTOMERS, id: loan.customerId },
        ],
      });
    }

    return loan;
  }

  async syncAll(workspaceId?: string, query?: any) {
    let where = {};

    if (workspaceId) where = { workspaceId, ...query };

    const activatedLoans = await this.repository.find({
      where,
      select: ['id'],
    });

    await Promise.all(
      activatedLoans.map((v) => this.queueProducers.syncLoan(v.id)),
    );
  }

  async syncCustomer(customerId: string) {
    const loans = await this.repository.find({
      where: { customerId },
      select: ['id'],
    });
    await Promise.all(loans.map((v) => this.queueProducers.syncLoan(v.id)));
  }

  async syncCustomerBranch() {
    const loans = await this.repository.find({
      where: { isArchived: Not(true) },
      select: ['id', 'customerId', 'workspaceBranchId', 'workspaceId'],
    });

    for (const loan of loans) {
      const customer = await this.customers.get({
        id: loan.customerId,
        workspaceId: loan.workspaceId,
      });
      if (customer.workspaceBranchId !== loan.workspaceBranchId) {
        await this.customers.bulkUpdateWorkspaceBranch({
          workspaceId: customer.workspaceId,
          input: {
            ids: [customer._id.toString()],
            workspaceBranchId: loan.workspaceBranchId,
          },
        });
      }
    }
  }

  async healthCheck(workspaceId: RawObjectId) {
    await this.syncAll(mustBeObjectId(workspaceId).toString(), {
      status: In([
        LoanStatus.FULFILLED,
        LoanStatus.PENDING,
        LoanStatus.OVERDUE,
      ]),
    });

    const settings = await this.workspaceSettings.get(workspaceId);

    if (
      settings.loanSettings &&
      settings.loanSettings.warningReceiptBeforeDays
    ) {
      const now = DateTime.getNowInSeconds();
      const oneDay = 24 * 60 * 60;

      const nextReceipts = await this.list({
        workspaceId,
        query: {
          rangeNextReceiptAt: `${now}-${now + oneDay * settings.loanSettings.warningReceiptBeforeDays}`,
        },
      });

      if (nextReceipts.count > 0) {
        const relatedMembers = await this.workspaceMembers.getByPermission(
          workspaceId,
          WorkspacePermission.LOANS_PAY,
        );
        await this.notifications.createMultiple({
          workspaceId: mustBeObjectId(workspaceId).toString(),
          userIds: relatedMembers.map((member) => member.userId),
          title: 'loans_notification',
          body: 'loans_receipt_warning',
          bodyParams: {
            amount: nextReceipts.count,
            days: settings.loanSettings.warningReceiptBeforeDays,
          },
          type: NotificationType.WARNING,
          route: `/loans?ltab=active&loansstatusFULFILLED-sort=nextReceiptAtAsc`,
        });
      }
    }

    return {
      time: DateTime.format(new Date(), {
        dateStyle: 'full',
        timeStyle: 'long',
      }),
    };
  }

  async rejectPendingLoans(workspaceId: RawObjectId) {
    const loans = await this.list({
      workspaceId,
      query: {
        status: LoanStatus.PENDING,
        getAll: true,
      },
    });

    if (loans.count <= 0) {
      return {
        time: DateTime.format(new Date(), {
          dateStyle: 'medium',
          timeStyle: 'long',
        }),
        message: 'No pending loans to reject',
      };
    }

    const readyToArchive = loans.data.filter((v) => {
      const isPassedDay =
        DateTime.toSeconds(DateTime.getRange(v.createdAt, 'day').start) <
        DateTime.toSeconds(DateTime.subtract(new Date(), 'day', 1));
      return isPassedDay;
    });

    if (readyToArchive.length <= 0) return;

    await this.bulkReject({
      workspaceId,
      input: {
        loanIds: readyToArchive.map((v) => v.id),
        reason: 'loan_auto_reject',
      },
    });

    return {
      time: DateTime.format(new Date(), {
        dateStyle: 'medium',
        timeStyle: 'long',
      }),
      message: `Rejected ${readyToArchive.length} pending loans`,
    };
  }
}
