import { BadRequestException } from '@nestjs/common';
import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { Auth, Member, RequestLocale } from '../app.decorators';
import { AppMessage } from '../app.message';
import { CustomerEntity } from '../customers/customers.entity';
import { CustomersService } from '../customers/customers.service';
import { CustomerShortInfo } from '../customers/customers.types';
import {
  BulkUpdateWorkspaceBranchInput,
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { AppLocale } from '../lang/lang.types';
import { translate } from '../lang/lang.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { LoanEntity } from './entities/loan.entity';
import {
  BulkArchiveLoansInput,
  BulkRejectLoanInput,
  CreateLoanInput,
  FulfillLoanInput,
  RejectLoanInput,
  SignLoanInput,
  UpdateLoanAmountInput,
  UpdateLoanAssetDataInput,
  UpdateLoanPackageInput,
} from './loans.inputs';
import { LoansService } from './loans.service';
import {
  CalculateLoanPaymentPlanInput,
  LoanAssetEstimations,
  LoanLiquidationCalculated,
  LoanPaymentPlanResult,
  SetLoanAssetEstimationsInput,
} from './loans.types';

@ObjectType()
export class LoansPaginated extends PaginatedResponse(LoanEntity) {}

@Resolver(() => LoanEntity)
export class LoansResolver {
  constructor(
    private readonly service: LoansService,
    private readonly customers: CustomersService,
    private readonly workspaceBranches: WorkspaceBranchesService,
  ) {}

  @Query(() => LoanAssetEstimations)
  @Auth({ member: true })
  async getLoanAssetEstimations(@Member() member: WorkspaceMember) {
    return this.service.getAssetEstimations(member.workspaceId);
  }

  @Mutation(() => LoanAssetEstimations)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async setLoanAssetEstimations(
    @Member() member: WorkspaceMember,
    @Args('input') input: SetLoanAssetEstimationsInput,
  ) {
    return this.service.setAssetEstimations(member.workspaceId, input);
  }

  @Query(() => LoanEntity)
  @Auth({ member: true })
  async getLoanById(@Member() member: WorkspaceMember, @Args('id') id: string) {
    return this.service.get({ id, member });
  }

  @Query(() => LoanEntity)
  @Auth({ member: true })
  async getLoanByCode(
    @Member() member: WorkspaceMember,
    @Args('code') code: string,
  ) {
    return this.service.getByCode({ code, member });
  }

  @Query(() => LoanPaymentPlanResult)
  @Auth({ member: true })
  async calculateLoanPaymentPlan(
    @Args('input') input: CalculateLoanPaymentPlanInput,
    @Member() member: WorkspaceMember,
  ): Promise<LoanPaymentPlanResult> {
    const loanPackages = await this.service.getLoanPackages(member.workspace);
    const loanPackage = loanPackages.find((p) => p.id === input.packageId);
    if (!loanPackage) {
      throw new BadRequestException(AppMessage.LOAN_PACKAGE_NOT_FOUND);
    }

    return this.service.calculatePaymentPlan({
      loanPackage,
      amount: input.amount,
      startTime: input.startTime,
    });
  }

  @Query(() => LoansPaginated)
  @Auth({ member: true })
  async getLoans(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    const { data, count } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });

    return {
      results: data,
      total: count,
    };
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async createLoan(
    @Member() member: WorkspaceMember,
    @Args('input') input: CreateLoanInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async signLoan(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: SignLoanInput,
  ) {
    return this.service.sign({ member, id, input });
  }

  @Mutation(() => [LoanEntity])
  @Auth({ permission: WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH })
  async bulkUpdateLoanWorkspaceBranch(
    @Member() member: WorkspaceMember,
    @Args('input') input: BulkUpdateWorkspaceBranchInput,
  ) {
    return this.service.bulkUpdateWorkspaceBranch({ member, input });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async updateLoanAmount(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: UpdateLoanAmountInput,
  ) {
    return this.service.updateAmount({ member, id, input });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async updateLoanAssetData(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: UpdateLoanAssetDataInput,
  ) {
    return this.service.updateAssetData({ member, id, input });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async updateLoanPackage(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: UpdateLoanPackageInput,
  ) {
    return this.service.updatePackage({ member, id, input });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async approveLoan(@Member() member: WorkspaceMember, @Args('id') id: string) {
    return this.service.approve({ member, id });
  }

  @Mutation(() => [LoanEntity])
  @Auth({ member: true })
  async rejectLoan(
    @Member() member: WorkspaceMember,
    @Args('input') input: RejectLoanInput,
    @Args('id') id: string,
  ) {
    return this.service.reject({ member, id, input });
  }

  @Mutation(() => [LoanEntity])
  @Auth({ member: true })
  async bulkRejectLoans(
    @Member() member: WorkspaceMember,
    @Args('input') input: BulkRejectLoanInput,
  ) {
    return this.service.bulkReject({ member, input });
  }

  @Mutation(() => [LoanEntity])
  @Auth({ member: true })
  async bulkRevertRejectedLoans(
    @Member() member: WorkspaceMember,
    @Args('loanIds', { type: () => [String] }) loanIds: string[],
  ) {
    return this.service.bulkRevertRejected({ member, loanIds });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async archiveLoan(@Member() member: WorkspaceMember, @Args('id') id: string) {
    return this.service.archive({ member, id });
  }

  @Mutation(() => [String])
  @Auth({ member: true })
  async bulkArchiveLoans(
    @Member() member: WorkspaceMember,
    @Args('input') input: BulkArchiveLoansInput,
  ) {
    return this.service.bulkArchive({ member, input });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async healthCheckLoan(@Args('id') id: string) {
    return this.service.sync(id);
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async fulfillLoan(
    @Member() member: WorkspaceMember,
    @Args('input') input: FulfillLoanInput,
    @Args('id') id: string,
  ) {
    return this.service.fulfill({ member, input, id });
  }

  @Query(() => LoanLiquidationCalculated)
  @Auth({ member: true })
  async liquidateLoanCalculate(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    const { calculated } = await this.service.liquidateCalculate({
      member,
      id,
    });
    return calculated;
  }

  @Mutation(() => String)
  @Auth({ member: true })
  async liquidateLoan(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    const result = await this.service.liquidate({ member, id });
    return result.liquidationReceipt.id;
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async revertLiquidationLoan(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.revertLiquidation({ member, id });
    return this.service.sync(id);
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async revertFulfilledLoan(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.revertFulfilled({ member, id });
  }

  @Mutation(() => LoanEntity)
  @Auth({ member: true })
  async revertApproveLoan(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.revertApprove({ member, id });
  }

  @ResolveField(() => CustomerEntity, { name: 'customer' })
  async resolveCustomer(@Parent() loan: LoanEntity) {
    const unknownCustomer: CustomerShortInfo = {
      _id: loan.customerId,
      code: 'unknown',
      name: 'Unknown',
      tagIds: [],
    };

    return this.customers
      .getWithCache({ id: loan.customerId, workspaceId: loan.workspaceId })
      .catch(() => unknownCustomer);
  }

  @ResolveField(() => String, { name: 'rejectReason', nullable: true })
  async resolveRejectReason(
    @Parent() loan: LoanEntity,
    @RequestLocale() locale?: AppLocale,
  ) {
    if (!loan.rejectReason) return null;
    return translate(loan.rejectReason, locale);
  }

  @ResolveField(() => WorkspaceBranchEntity, {
    name: 'workspaceBranch',
    nullable: true,
  })
  async resolveWorkspaceBranch(@Parent() loan: LoanEntity) {
    if (!loan.workspaceBranchId) return null;
    return this.workspaceBranches.getWithCache({
      _id: loan.workspaceBranchId,
      workspaceId: loan.workspaceId,
    });
  }
}
