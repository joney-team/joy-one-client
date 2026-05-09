import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  TaskChildOrder,
  TaskChildTimeline,
  TaskPriority,
  TaskStatus,
  TaskTimeTracking,
  TaskTimeTrackingInput,
} from '../tasks.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { CustomerEntity } from '../../customers/customers.entity';
import { TagEntity } from '../../tags/entities/tag.entity';
import { PartnerEntity } from '../../partners/partners.entity';

@ObjectType('Task')
@Entity('tasks')
@Unique('tasks-unique', ['code'])
export class TaskEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  code: string;

  @Field(() => String, { nullable: true })
  @Column()
  parentId?: string;

  @Field(() => String, { nullable: true })
  @Column()
  description?: string;

  @Field(() => String)
  @Column()
  status: string;

  @Field(() => TaskPriority, { nullable: true })
  @Column()
  priority?: TaskPriority;

  @Field(() => Number, { nullable: true })
  @Column()
  startDate?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  dueDate?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  childStartDate?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  childDueDate?: number;

  @Field(() => [String])
  @Column()
  assigneeUserIds: string[];

  @Field(() => [String])
  @Column()
  relatedUserIds: string[];

  @Field(() => [String])
  @Column()
  partnerIds: string[];

  @Field(() => Number)
  @Column()
  order: number;

  @Field(() => Number, { nullable: true })
  @Column()
  points?: number;

  @Field(() => String, { nullable: true })
  @Column()
  customerId?: string;

  @Field(() => String, { nullable: true })
  @Column()
  folderId?: string;

  @Field(() => [String])
  @Column()
  tagIds?: string[];

  @Field(() => Number, { nullable: true })
  @Column()
  closedAt?: number;

  @Field(() => [TaskTimeTracking], { nullable: true })
  @Column()
  timeTrackings?: TaskTimeTrackingInput[];

  @Field(() => Number, { nullable: true })
  @Column()
  estimatedTime?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  childEstimatedTime?: number;

  @Field(() => Number)
  @Column()
  progress: number;

  @Field(() => Number)
  @Column()
  childProgress: number;

  @Field(() => Number)
  @Column({ default: 0 })
  childCount: number;

  @Field(() => TaskChildOrder)
  @Column('json')
  childOrder: TaskChildOrder;

  @Field(() => TaskChildTimeline, { nullable: true })
  @Column('json', { nullable: true })
  childTimeline?: TaskChildTimeline | null;

  @Field(() => [String])
  @Column({ type: 'simple-array', nullable: true })
  mentionedUserIds?: string[];

  @Field(() => CustomerEntity, { nullable: true })
  customer?: CustomerEntity;

  @Field(() => TagEntity, { nullable: true })
  folder?: TagEntity;

  @Field(() => [TagEntity])
  tags?: TagEntity[];

  @Field(() => [PartnerEntity], { nullable: true })
  partners?: PartnerEntity[];

  @Field(() => TaskEntity, { nullable: true })
  parent?: TaskEntity;

  @Field(() => Boolean, { nullable: true })
  isArchived: boolean | null;

  @Field(() => [TaskStatus])
  statuses: TaskStatus[];
}
