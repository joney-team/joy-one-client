import {
  Args,
  ArgsType,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedArgs,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { CustomFieldEntity } from './custom-fields.entity';
import { CustomFieldsService } from './custom-fields.service';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { CustomFieldInput } from './custom-fields.types';

@ObjectType()
export class CustomFieldsPaginated extends PaginatedResponse(
  CustomFieldEntity,
) {}

@InputType()
export class CustomFieldsQuery {
  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  key?: string;

  @Field(() => [String], { nullable: true })
  entities?: string[];
}

@ArgsType()
export class CustomFieldsPaginatedArgs extends PaginatedArgs(
  CustomFieldsQuery,
) {}

@Resolver(() => CustomFieldEntity)
export class CustomFieldsResolver {
  constructor(private readonly service: CustomFieldsService) {}

  @Query(() => CustomFieldsPaginated)
  @Auth({ member: true })
  async getCustomFields(
    @Args() args: CustomFieldsPaginatedArgs,
    @Member() member: WorkspaceMember,
  ): Promise<CustomFieldsPaginated> {
    const { data, count } = await this.service.list({
      query: normalizeQuery(args),
      member,
    });
    return {
      results: data,
      total: count,
    };
  }

  @Query(() => CustomFieldEntity)
  @Auth({ member: true })
  async getCustomFieldById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ member, id });
  }

  @Mutation(() => CustomFieldEntity)
  @Auth({ permission: WorkspacePermission.CUSTOM_FIELDS_MANAGER })
  async createCustomField(
    @Member() member: WorkspaceMember,
    @Args('input') input: CustomFieldInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => CustomFieldEntity)
  @Auth({ permission: WorkspacePermission.CUSTOM_FIELDS_MANAGER })
  async updateCustomField(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: CustomFieldInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.CUSTOM_FIELDS_MANAGER })
  async deleteCustomField(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.delete({ member, id });
    return true;
  }
}
