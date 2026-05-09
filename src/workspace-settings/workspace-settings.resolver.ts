import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceSettingEntity } from './entities/workspace-setting.entity';
import { WorkspaceSettingsService } from './workspace-settings.service';
import { UpdateWorkspaceSettingInput } from './workspace-settings.types';

@Resolver(() => WorkspaceSettingEntity)
export class WorkspaceSettingsResolver {
  constructor(private readonly service: WorkspaceSettingsService) {}

  @Query(() => WorkspaceSettingEntity)
  @Auth({ member: true })
  async getWorkspaceSetting(@Member() member: WorkspaceMember) {
    return this.service.get(member.workspaceId);
  }

  @Mutation(() => WorkspaceSettingEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateWorkspaceSetting(
    @Member() member: WorkspaceMember,
    @Args('input') input: UpdateWorkspaceSettingInput,
  ) {
    return this.service.patchUpdate({ member, input });
  }
}
