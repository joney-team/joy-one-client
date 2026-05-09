import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from 'src/app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from 'src/database/database.utils';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { PluginAiAssistantEntity } from './entities/plugin-ai-assistant.entity';
import { PluginAiAssistantsService } from './plugin-ai-assistants.service';
import {
  CreatePluginAiAssistantInput,
  UpdatePluginAiAssistantInput,
} from './plugin-ai-assistants.types';

@ObjectType()
export class PluginAiAssistantsPaginated extends PaginatedResponse(
  PluginAiAssistantEntity,
) {}

@Resolver(() => PluginAiAssistantEntity)
export class PluginAiAssistantsResolver {
  constructor(private readonly service: PluginAiAssistantsService) {}

  @Query(() => PluginAiAssistantsPaginated)
  @Auth({ member: true })
  async getPluginAiAssistants(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Mutation(() => PluginAiAssistantEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async createPluginAiAssistant(
    @Member() member: WorkspaceMember,
    @Args('input') input: CreatePluginAiAssistantInput,
  ) {
    return this.service.create({
      member,
      input,
    });
  }

  @Mutation(() => PluginAiAssistantEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updatePluginAiAssistant(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: UpdatePluginAiAssistantInput,
  ) {
    return this.service.update({
      member,
      id,
      input,
    });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async deletePluginAiAssistant(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.delete({
      member,
      id,
    });
  }
}
