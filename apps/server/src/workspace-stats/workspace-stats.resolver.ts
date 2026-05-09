import {
  Args,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { UserRole } from '../users/users.types';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  WorkspaceStatsEntity,
  WorkspaceStatWorkspaceInformation,
} from './entities/workspace-stat.entity';
import { WorkspaceStatsService } from './workspace-stats.service';
import { WorkspaceType } from 'src/workspaces/workspaces.types';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

@ObjectType()
export class WorkspaceStatsPaginated extends PaginatedResponse(
  WorkspaceStatsEntity,
) {}

@Resolver(() => WorkspaceStatsEntity)
export class WorkspaceStatsResolver {
  constructor(
    private readonly service: WorkspaceStatsService,
    private readonly workspaces: WorkspacesService,
  ) {}

  @Query(() => WorkspaceStatsPaginated)
  @Auth({ userRoles: [UserRole.ADMIN] })
  async getWorkspaceStats(@Args() args: DynamicPaginatedArgs) {
    return this.service.list({
      query: normalizeQuery(args),
    });
  }

  @Query(() => WorkspaceStatsEntity)
  @Auth({ member: true })
  async getWorkspaceStat(@Member() member: WorkspaceMember) {
    return this.service.get(member.workspaceId);
  }

  @ResolveField(() => WorkspaceStatWorkspaceInformation, { name: 'workspace' })
  async resolveWorkspace(@Parent() data: WorkspaceStatsEntity) {
    return this.workspaces.get(data.workspaceId);
  }

  @ResolveField(() => WorkspaceType, { name: 'type' })
  async resolveWorkspaceType(@Parent() data: WorkspaceStatsEntity) {
    const workspace = await this.workspaces.get(data.workspaceId);
    return workspace.type;
  }
}
