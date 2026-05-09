import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member, RequestLocale } from 'src/app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from 'src/database/database.utils';
import { AppLocale } from 'src/lang/lang.types';
import { translate } from 'src/lang/lang.utils';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import { NotificationEntity } from './notifications.entity';
import { NotificationsService } from './notifications.service';
import { UserNotificationStat } from './notifications.types';

@ObjectType()
export class NotificationsPaginated extends PaginatedResponse(
  NotificationEntity,
) {}

@Resolver(() => NotificationEntity)
export class NotificationsResolver {
  constructor(private readonly service: NotificationsService) {}

  @Query(() => NotificationsPaginated)
  @Auth({ member: true })
  async getNotifications(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      query: { ...normalizeQuery(args), userId: member.userId },
      member,
    });
  }

  @Query(() => UserNotificationStat)
  @Auth({ member: true })
  async getNotificationStat(@Member() member: WorkspaceMember) {
    return this.service.getUserStat(member, member.workspace);
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async cleanNotifications(@Member() member: WorkspaceMember) {
    await this.service.clean(member);
    return true;
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async markAllNotificationsAsReaded(@Member() member: WorkspaceMember) {
    await this.service.markAllAsReaded(member);
    return true;
  }

  @Mutation(() => NotificationEntity)
  @Auth({ member: true })
  async markNotificationAsReaded(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.markAsReaded(member, id);
  }

  @ResolveField(() => String, { name: 'title' })
  async resolveTitle(
    @Parent() notification: NotificationEntity,
    @RequestLocale() locale?: AppLocale,
  ) {
    return translate(notification.title, locale, notification.titleParams);
  }

  @ResolveField(() => String, { name: 'body' })
  async resolveBody(
    @Parent() notification: NotificationEntity,
    @RequestLocale() locale?: AppLocale,
  ) {
    return translate(notification.body, locale, notification.bodyParams);
  }
}
