import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from 'src/app.decorators';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { PluginMessageHubsService } from './plugin-message-hubs.service';
import {
  PluginMessageHub,
  PluginMessageHubInput,
} from './plugin-message-hubs.types';

@Resolver(() => PluginMessageHub)
export class PluginMessageHubsResolver {
  constructor(private readonly service: PluginMessageHubsService) {}

  @Query(() => [PluginMessageHub])
  @Auth({ member: true })
  async getPluginMessageHubs(@Member() member: WorkspaceMember) {
    return this.service.list({
      ref: member.workspaceId,
    });
  }

  @Mutation(() => PluginMessageHub)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async createPluginMessageHub(
    @Member() member: WorkspaceMember,
    @Args('input') input: PluginMessageHubInput,
  ) {
    return this.service.create({ input, member });
  }

  @Mutation(() => PluginMessageHub)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updatePluginMessageHub(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: PluginMessageHubInput,
  ) {
    return this.service.update({ id, input, member });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async deletePluginMessageHub(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.remove({ id, member });
    return true;
  }
}
