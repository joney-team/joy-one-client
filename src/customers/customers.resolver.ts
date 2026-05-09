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
import { Auth, Member } from '../app.decorators';
import { logger } from '../app.logger';
import {
  BulkUpdateWorkspaceBranchInput,
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import {
  renderPrevVnLocation,
  renderVnLocation,
} from '../locations/locations.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { validateWorkspaceAccessable } from '../workspaces/workspaces.utils';
import { AssignCustomerInput, CustomerInput } from './customers.inputs';
import { CustomerEntity } from './customers.entity';
import { CustomersService } from './customers.service';

@ObjectType()
export class CustomersPaginated extends PaginatedResponse(CustomerEntity) {}

@Resolver(() => CustomerEntity)
export class CustomersResolver {
  constructor(
    private readonly service: CustomersService,
    private readonly workspaceBranches: WorkspaceBranchesService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => CustomersPaginated)
  @Auth({ member: true })
  async getCustomers(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ): Promise<CustomersPaginated> {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Query(() => [CustomerEntity])
  @Auth({ member: true })
  async getCustomersByIds(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Member() member: WorkspaceMember,
  ) {
    const customers = await this.service.getByIds(ids);
    customers.forEach((customer) =>
      validateWorkspaceAccessable({ member, data: customer }),
    );
    return customers;
  }

  @Query(() => Boolean)
  @Auth({ member: true })
  async isCustomerPhoneExisted(
    @Args('phone', { type: () => String }) phone: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.isPhoneExisted({ phone, member });
  }

  @Query(() => CustomerEntity)
  @Auth({ member: true })
  async getCustomerById(
    @Args('id') _id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ id: _id, member });
  }

  @Query(() => CustomerEntity)
  @Auth({ member: true })
  async getCustomerByCode(
    @Args('code') code: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.getWithCacheByCode({ code, member });
  }

  @Mutation(() => [CustomerEntity])
  @Auth({ permission: WorkspacePermission.CUSTOMERS_UPDATE_INFO })
  async bulkUpdateCustomerWorkspaceBranch(
    @Member() member: WorkspaceMember,
    @Args('input') input: BulkUpdateWorkspaceBranchInput,
  ) {
    return this.service.bulkUpdateWorkspaceBranch({ member, input });
  }

  @Mutation(() => CustomerEntity)
  @Auth({ member: true })
  async createCustomer(
    @Args('input') input: CustomerInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.create({ input, member });
  }

  @Mutation(() => CustomerEntity)
  @Auth({ member: true })
  async updateCustomer(
    @Args('id') _id: string,
    @Args('input') input: CustomerInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.update({ id: _id, input, member });
  }

  @Mutation(() => CustomerEntity)
  @Auth({ member: true })
  async assignCustomer(
    @Args('id') _id: string,
    @Args('input') input: AssignCustomerInput,
    @Member() member: WorkspaceMember,
  ) {
    await this.service.assign({ id: _id, input, member });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async archiveCustomer(
    @Args('id') _id: string,
    @Member() member: WorkspaceMember,
  ) {
    await this.service.archive({ id: _id, member });
    return true;
  }

  @ResolveField(() => WorkspaceBranchEntity, {
    name: 'workspaceBranch',
    nullable: true,
  })
  async resolveWorkspaceBranch(@Parent() customer: CustomerEntity) {
    if (!customer.workspaceBranchId) return null;
    return this.workspaceBranches.getWithCache({
      _id: customer.workspaceBranchId,
      workspaceId: customer.workspaceId,
    });
  }

  @ResolveField(() => String, {
    name: 'workspaceBranchId',
    nullable: true,
  })
  async resolveWorkspaceBranchId(@Parent() customer: CustomerEntity) {
    return customer.workspaceBranchId ?? null;
  }

  @ResolveField(() => CustomerEntity, {
    name: 'presenterCustomer',
    nullable: true,
  })
  async resolvePresenterCustomer(@Parent() customer: CustomerEntity) {
    if (!customer.presenterCustomerId) return null;

    return this.service.getWithCache({
      id: customer.presenterCustomerId,
      workspaceId: customer.workspaceId,
    });
  }

  @ResolveField(() => [WorkspaceMemberPublicInfo], { name: 'assigneeUsers' })
  async resolveAssigneeUsers(@Parent() customer: CustomerEntity) {
    return this.workspaceMembers
      .getInfoByUserIds({
        userIds: customer.assigneeUserIds,
        workspaceId: customer.workspaceId,
      })
      .catch((error) => {
        logger.error(error, {
          case: `Can't get assignee users for customer ${customer._id.toString()}`,
        });
        return [];
      });
  }

  @ResolveField(() => String, {
    name: 'vnPrevLocationFullAddress',
    nullable: true,
  })
  async resolveVnPrevLocationFullAddress(@Parent() customer: CustomerEntity) {
    if (!customer.location) return null;
    return renderPrevVnLocation(customer.location);
  }

  @ResolveField(() => String, {
    name: 'vnPrevSecondaryLocationFullAddress',
    nullable: true,
  })
  async resolveVnPrevSecondaryLocationFullAddress(
    @Parent() customer: CustomerEntity,
  ) {
    if (!customer.secondaryLocation) return null;
    return renderPrevVnLocation(customer.secondaryLocation);
  }

  @ResolveField(() => String, {
    name: 'vnLocationFullAddress',
    nullable: true,
  })
  async resolveVnLocationFullAddress(@Parent() customer: CustomerEntity) {
    if (!customer.vnLocation) return null;
    return renderVnLocation(customer.vnLocation);
  }

  @ResolveField(() => String, {
    name: 'vnSecondaryLocationFullAddress',
    nullable: true,
  })
  async resolveVnSecondaryLocationFullAddress(
    @Parent() customer: CustomerEntity,
  ) {
    if (!customer.vnSecondaryLocation) return null;
    return renderVnLocation(customer.vnSecondaryLocation);
  }
}
