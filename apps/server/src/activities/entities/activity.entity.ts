import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { AppEntity } from '../../app.types';
import { GraphQLJSONObject } from '../../graphql/graphql-type';
import { ReactionsCount } from '../../reactions/reactions.types';
import { WorkspaceMemberPublicInfo } from '../../workspace-members/entities/workspace-member.entity';
import { ActivityType } from '../activities.types';

@Entity('activities')
export class ActivityEntity extends BaseMongoEntity {
  @Column()
  contextType: string;

  @Column()
  contextId: string;

  @Column()
  type: ActivityType;

  @Column()
  content?: string;

  @Column()
  contentLastModifiedAt?: number;

  @Column()
  data?: Record<string, unknown>;

  @Column()
  parentId?: string;

  @Column()
  childCount?: number;

  @Column()
  isPinned?: boolean;

  @Column()
  pinnedAt?: number;

  @Column()
  pinnedByUserId?: string;

  @Column()
  mentionedUserIds?: string[];
}

@ObjectType()
export class Activity {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  contextType: AppEntity;

  @Field(() => String)
  contextId: string;

  @Field(() => ActivityType)
  type: ActivityType;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field({ nullable: true })
  contentLastModifiedAt?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: Record<string, unknown>;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => Number, { nullable: true })
  childCount?: number;

  @Field(() => Boolean, { nullable: true })
  isPinned?: boolean;

  @Field(() => Number, { nullable: true })
  pinnedAt?: number;

  @Field(() => String, { nullable: true })
  pinnedByUserId?: string;

  @Field(() => WorkspaceMemberPublicInfo, { nullable: true })
  pinnedByUser?: WorkspaceMemberPublicInfo;

  @Field(() => WorkspaceMemberPublicInfo, { nullable: true })
  createdByUser?: WorkspaceMemberPublicInfo;

  @Field(() => Number, { nullable: true })
  createdAt?: number;

  @Field(() => ReactionsCount)
  reactionsCount: ReactionsCount;

  @Field({ nullable: true })
  updatedAt?: number;
}
