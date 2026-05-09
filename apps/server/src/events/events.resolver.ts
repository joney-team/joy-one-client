import {
  Args,
  ArgsType,
  Field,
  InputType,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppLocale } from 'src/lang/lang.types';
import { translate } from 'src/lang/lang.utils';
import { Auth, Member, RequestLocale } from '../app.decorators';
import { RelatedEntity } from '../database/database.entities';
import {
  normalizeQuery,
  PaginatedArgs,
  PaginatedResponse,
} from '../database/database.utils';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { EventEntity } from './events.entity';
import { EventsService } from './events.service';
import { EventType } from './events.types';

@ObjectType()
export class EventsPaginated extends PaginatedResponse(EventEntity) {}

@InputType()
export class EventsQuery {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ref?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => EventType, { nullable: true })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;
}

@ArgsType()
export class EventsPaginatedArgs extends PaginatedArgs(EventsQuery) {}

@Resolver(() => EventEntity)
export class EventsResolver {
  constructor(
    private readonly service: EventsService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => EventEntity)
  @Auth({ member: true })
  async getEventById(@Args('id', { type: () => String }) id: string) {
    return this.service.get(id);
  }

  @Query(() => EventsPaginated)
  @Auth({ member: true })
  async getEvents(
    @Member() member: WorkspaceMember,
    @Args() args: EventsPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'user',
    nullable: true,
  })
  async resolveUser(@Parent() event: EventEntity) {
    if (!event.userId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: event.userId,
      workspaceId: event.workspaceId,
    });
  }

  @ResolveField(() => [RelatedEntity], {
    name: 'relatedEntities',
  })
  async resolveRelatedEntities(@Parent() event: EventEntity) {
    if (!event.relatedEntities) return [];
    return this.service.normalizeRelatedEntities(event.relatedEntities);
  }

  @ResolveField(() => String, {
    name: 'typeName',
    nullable: true,
  })
  async resolveTypeName(
    @Parent() event: EventEntity,
    @RequestLocale() locale: AppLocale,
  ) {
    if (!event.type) return '';
    return translate(`event_type_${event.type}`, locale) || event.type;
  }
}
