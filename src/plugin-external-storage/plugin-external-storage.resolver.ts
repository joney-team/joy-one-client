import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { PluginExternalStorageService } from './plugin-external-storage.service';
import {
  PluginExternalStorage,
  PluginExternalStorageSignUploadUrlInput,
  SetPluginExternalStorageInput,
  SignUploadUrlResponse,
} from './plugin-external-storage.types';

@Resolver(() => PluginExternalStorage)
export class PluginExternalStorageResolver {
  constructor(private readonly service: PluginExternalStorageService) {}

  @Query(() => PluginExternalStorage, { nullable: true })
  @Auth({ member: true })
  async getPluginExternalStorage(@Member() member: WorkspaceMember) {
    return this.service.get({ member });
  }

  @Mutation(() => PluginExternalStorage)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async setPluginExternalStorage(
    @Member() member: WorkspaceMember,
    @Args('input') input: SetPluginExternalStorageInput,
  ) {
    return this.service.set({ member, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async healthcheckPluginExternalStorage(@Member() member: WorkspaceMember) {
    return this.service.healthcheck({ member });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async removePluginExternalStorage(@Member() member: WorkspaceMember) {
    return this.service.remove({ member });
  }

  @Mutation(() => SignUploadUrlResponse)
  @Auth({ member: true })
  async pluginExternalStorageSignUploadUrl(
    @Member() member: WorkspaceMember,
    @Args('input') input: PluginExternalStorageSignUploadUrlInput,
  ) {
    return this.service.signUploadUrl({ member, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async toggleDisablePluginExternalStorage(@Member() member: WorkspaceMember) {
    return this.service.toggleDisable({ workspaceId: member.workspaceId });
  }

  @Mutation(() => Number)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async fetchExternalStorageSize(@Member() member: WorkspaceMember) {
    return this.service.fetchSize({ workspaceId: member.workspaceId });
  }
}
