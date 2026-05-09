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
import {
  BulkUpdateWorkspaceBranchInput,
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { BulkArchiveInput, CustomerFormInput } from './customer-forms.dtos';
import { CustomerFormEntity } from './customer-forms.entity';
import { CustomerFormsService } from './customer-forms.service';

@ObjectType()
export class CustomerFormsPaginated extends PaginatedResponse(
  CustomerFormEntity,
) {}

@Resolver(() => CustomerFormEntity)
export class CustomerFormsResolver {
  constructor(
    private readonly service: CustomerFormsService,
    private readonly workspaceBranches: WorkspaceBranchesService,
  ) {}

  @Query(() => CustomerFormsPaginated)
  @Auth({ member: true })
  async getCustomerForms(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    const { count, data } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });
    return {
      total: count,
      results: data,
    };
  }

  @Query(() => CustomerFormEntity)
  @Auth({ member: true })
  async getCustomerFormById(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ id, member });
  }

  @Mutation(() => CustomerFormEntity)
  async createCustomerForm(@Args('input') input: CustomerFormInput) {
    return this.service.create(input);
  }

  @Mutation(() => CustomerFormEntity)
  @Auth({ member: true })
  async updateCustomerForm(
    @Args('id') id: string,
    @Args('input') input: CustomerFormInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.update({ id, input, member });
  }

  @Mutation(() => CustomerFormEntity)
  @Auth({ member: true })
  async archiveCustomerForm(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.archive({ id, member });
  }

  @Mutation(() => [CustomerFormEntity])
  @Auth({ member: true })
  async bulkArchiveCustomerForms(
    @Args('input') input: BulkArchiveInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.bulkArchive({ member, ids: input.ids });
  }

  @Mutation(() => [CustomerFormEntity])
  @Auth({ member: true })
  async bulkUpdateCustomerFormWorkspaceBranch(
    @Args('input') input: BulkUpdateWorkspaceBranchInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.bulkUpdateWorkspaceBranch({ member, input });
  }

  @ResolveField(() => WorkspaceBranchEntity, {
    name: 'workspaceBranch',
    nullable: true,
  })
  async resolveWorkspaceBranch(@Parent() data: CustomerFormEntity) {
    if (!data.workspaceBranchId) return null;
    return this.workspaceBranches.getWithCache({
      _id: data.workspaceBranchId,
      workspaceId: data.workspaceId,
    });
  }

  @ResolveField(() => String, {
    name: 'workspaceBranchId',
    nullable: true,
  })
  async resolveWorkspaceBranchId(@Parent() data: CustomerFormEntity) {
    if (!data.workspaceBranchId) return null;
    return data.workspaceBranchId;
  }

  @ResolveField(() => String, {
    name: 'workspaceId',
  })
  async resolveWorkspaceId(@Parent() data: CustomerFormEntity) {
    return data.workspaceId;
  }
}
