import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { CustomerEntity } from '../customers/customers.entity';
import { CustomersService } from '../customers/customers.service';
import {
  DynamicPaginatedArgs,
  PaginatedResponse,
  normalizeQuery,
} from '../database/database.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { ReceiptEntity } from './entities/receipt.entity';
import { ReceiptsService } from './receipts.service';
import {
  CreateReceiptInput,
  DisburseReceiptInput,
  PartialPaymentInput,
  PayReceiptInput,
  UpdateReceiptInput,
} from './receipts.types';

@ObjectType()
export class ReceiptsPaginated extends PaginatedResponse(ReceiptEntity) {}

@Resolver(() => ReceiptEntity)
export class ReceiptsResolver {
  constructor(
    private readonly service: ReceiptsService,
    private readonly customers: CustomersService,
    private readonly workspaceBranches: WorkspaceBranchesService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => ReceiptsPaginated)
  @Auth({ member: true })
  async getReceipts(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Query(() => ReceiptEntity)
  @Auth({ member: true })
  async getReceiptById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ id, member });
  }

  @Query(() => ReceiptEntity)
  @Auth({ member: true })
  async getReceiptByCode(
    @Member() member: WorkspaceMember,
    @Args('code') code: string,
  ) {
    return this.service.getByCode({ code, member });
  }

  @Mutation(() => ReceiptEntity)
  @Auth({ member: true })
  async createReceipt(
    @Member() member: WorkspaceMember,
    @Args('input') input: CreateReceiptInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => ReceiptEntity)
  @Auth({ member: true })
  async updateReceipt(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: UpdateReceiptInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Mutation(() => ReceiptEntity)
  @Auth({ member: true })
  async payReceipt(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: PayReceiptInput,
  ) {
    return this.service.pay({ member, id, input });
  }

  @Mutation(() => ReceiptEntity)
  @Auth({ member: true })
  async disburseReceipt(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: DisburseReceiptInput,
  ) {
    return this.service.disburse({ member, id, input });
  }

  @Mutation(() => [ReceiptEntity])
  @Auth({ member: true })
  async partialPaymentReceipt(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: PartialPaymentInput,
  ) {
    const result = await this.service.partialPayment({ member, id, input });
    return result.receipts;
  }

  @Mutation(() => ReceiptEntity)
  @Auth({ member: true })
  async archiveReceipt(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.archive({ member, id });
  }

  @Mutation(() => ReceiptEntity)
  @Auth({ member: true })
  async revertPaymentReceipt(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.revertPayment({ member, id });
  }

  @ResolveField(() => WorkspaceBranchEntity, {
    name: 'workspaceBranch',
    nullable: true,
  })
  async resolveWorkspaceBranch(@Parent() receipt: ReceiptEntity) {
    if (!receipt.workspaceBranchId) return null;
    return this.workspaceBranches.getWithCache({
      _id: receipt.workspaceBranchId,
      workspaceId: receipt.workspaceId,
    });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'cashierUser',
    nullable: true,
  })
  async resolveCashierUser(@Parent() receipt: ReceiptEntity) {
    if (!receipt.cashierUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: receipt.cashierUserId,
      workspaceId: receipt.workspaceId,
    });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'disbursementUser',
    nullable: true,
  })
  async resolveDisbursementUser(@Parent() receipt: ReceiptEntity) {
    if (!receipt.disbursementUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: receipt.disbursementUserId,
      workspaceId: receipt.workspaceId,
    });
  }

  @ResolveField(() => CustomerEntity, {
    name: 'relatedCustomer',
    nullable: true,
  })
  async resolveRelatedCustomer(@Parent() receipt: ReceiptEntity) {
    if (!receipt.relatedCustomerId) return null;
    return this.customers.getWithCache({
      id: receipt.relatedCustomerId,
      workspaceId: receipt.workspaceId,
    });
  }
}
