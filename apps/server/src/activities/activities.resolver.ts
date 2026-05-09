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
import { AppEntity } from '../app.types';
import { PaginatedResponse } from '../database/database.utils';
import { ReactionsService } from '../reactions/reactions.service';
import { ReactionsCount } from '../reactions/reactions.types';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { Activity, ActivityEntity } from './entities/activity.entity';
import { ActivitiesService } from './activities.service';
import {
  ActivityPaginatedArgs,
  AddActivityArgs,
  GetActivityArgs,
  UpdateActivityArgs,
} from './activities.types';

@ObjectType()
export class ActivitiesPaginated extends PaginatedResponse(Activity) {}

@Resolver(() => Activity)
export class ActivitiesResolver {
  constructor(
    private readonly service: ActivitiesService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly reactions: ReactionsService,
  ) {}

  @Query(() => ActivitiesPaginated)
  @Auth({ member: true })
  async getActivities(
    @Member() member: WorkspaceMember,
    @Args() args: ActivityPaginatedArgs,
  ) {
    return this.service.list({ member, ...args });
  }

  @Query(() => Activity)
  @Auth({ member: true })
  async getActivityById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ member, id });
  }

  @Mutation(() => Activity)
  @Auth({ member: true })
  async addActivity(
    @Member() member: WorkspaceMember,
    @Args() args: AddActivityArgs,
  ) {
    return this.service.add({ member, ...args });
  }

  @Mutation(() => Activity)
  @Auth({ member: true })
  async updateActivity(
    @Member() member: WorkspaceMember,
    @Args() args: UpdateActivityArgs,
  ) {
    return this.service.update({ member, ...args });
  }

  @Mutation(() => Activity)
  @Auth({ member: true })
  async archiveActivity(
    @Member() member: WorkspaceMember,
    @Args() args: GetActivityArgs,
  ) {
    return this.service.archive({ member, ...args });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, { name: 'pinnedByUser' })
  async resolvePinnedByUser(@Parent() activity: ActivityEntity) {
    if (!activity.pinnedByUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: activity.pinnedByUserId,
      workspaceId: activity.workspaceId,
    });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, { name: 'createdByUser' })
  async resolveCreatedByUser(@Parent() activity: ActivityEntity) {
    if (!activity.createdByUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: activity.createdByUserId,
      workspaceId: activity.workspaceId,
    });
  }

  @ResolveField(() => ReactionsCount, { name: 'reactionsCount' })
  async resolveReactionsCount(@Parent() activity: ActivityEntity) {
    return this.reactions.count({
      entity: AppEntity.ACTIVITIES,
      entityId: activity._id.toString(),
      workspaceId: activity.workspaceId,
    });
  }
}
