import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from 'src/app.decorators';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { PluginZaloOaEntity } from './entities/plugin-zalo-oa.entity';
import { znsTemplateConfigs } from './plugin-zalo-oas.configs';
import { PluginZaloOasService } from './plugin-zalo-oas.service';
import {
  ConnectZaloOaResponse,
  PluginZaloOaSendZnsInput,
  UpdatePluginZaloOaInput,
  ZaloOaGmfGroup,
} from './plugin-zalo-oas.types';

@Resolver(() => PluginZaloOaEntity)
export class PluginZaloOasResolver {
  constructor(private service: PluginZaloOasService) {}

  @Query(() => GraphQLJSONObject)
  async getZaloZnsTemplateConfigs() {
    return znsTemplateConfigs;
  }

  @Query(() => [PluginZaloOaEntity])
  @Auth({ member: true })
  async getZaloOas(@Member() member: WorkspaceMember) {
    return this.service.getOas(member.workspaceId);
  }

  @Query(() => PluginZaloOaEntity)
  @Auth({ member: true })
  async getZaloOaById(
    @Member() member: WorkspaceMember,
    @Args('oaId') oaId: string,
  ) {
    return this.service.getByOaId({
      oaId,
      member,
    });
  }

  @Query(() => [ZaloOaGmfGroup])
  @Auth({ member: true })
  async getOaGmfGroups(@Member() member: WorkspaceMember) {
    return this.service.getOaGmfGroups({
      member,
    });
  }

  @Mutation(() => ConnectZaloOaResponse)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async connectZaloOa(@Member() member: WorkspaceMember) {
    return this.service.connect({
      member,
    });
  }

  @Mutation(() => PluginZaloOaEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async connectZaloOaCallback(
    @Args('code') code: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.connectCallback({ code, member });
  }

  @Mutation(() => PluginZaloOaEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async reconnectZaloOa(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.reconnect({ id, member });
  }

  @Mutation(() => PluginZaloOaEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateZaloOa(
    @Args('id') id: string,
    @Args('input') input: UpdatePluginZaloOaInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.update({
      id,
      input,
      member,
    });
  }

  @Mutation(() => PluginZaloOaEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async toggleEnableZaloOa(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.toggleEnable({
      id,
      member,
    });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async removeZaloOa(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    await this.service.remove({
      id,
      member,
    });

    return true;
  }

  @Mutation(() => PluginZaloOaEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async setZaloOaDefault(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.setDefault({
      id,
      member,
    });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async sendZNS(
    @Args('input') input: PluginZaloOaSendZnsInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.sendZNS({
      input,
      member,
    });
  }
}
