import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from 'src/app.decorators';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { PluginMetaPageEntity } from './plugin-meta-pages.entity';
import { PluginMetaPagesService } from './plugin-meta-pages.service';
import { PluginMetaPageInfo } from './plugin-meta-pages.types';

@Resolver(() => PluginMetaPageEntity)
export class PluginMetaPagesResolver {
  constructor(private readonly service: PluginMetaPagesService) {}

  @Query(() => [PluginMetaPageEntity])
  @Auth({ member: true })
  async getMetaPages(@Member() member: WorkspaceMember) {
    return this.service.getPages({ member });
  }

  @Mutation(() => [PluginMetaPageEntity])
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async connectMetaPages(
    @Member() member: WorkspaceMember,
    @Args('accessToken') accessToken: string,
  ) {
    return this.service.connectPages({ member, accessToken });
  }

  @Query(() => [PluginMetaPageInfo])
  @Auth({ member: true })
  async getMetaPagesInfos(
    @Member() member: WorkspaceMember,
    @Args('accessToken') accessToken: string,
  ) {
    return this.service.getPagesInfos({ member, accessToken });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async disconnectMetaPage(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.disconnect({ member, id });
  }
}
