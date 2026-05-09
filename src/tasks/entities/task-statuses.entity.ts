import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { TaskStatus, TaskContextType } from '../tasks.types';

@ObjectType()
@Entity('task-statuses')
export class TaskStatusesEntity extends BaseMongoEntity {
  @Field(() => TaskContextType, { nullable: true })
  @Column({ nullable: true })
  contextType?: TaskContextType | null;

  @Field(() => TaskContextType, { nullable: true })
  @Column({ nullable: true })
  contextId?: string | null;

  @Field(() => Boolean)
  @Column()
  isInherited: boolean;

  @Field(() => [TaskStatus])
  @Column()
  statuses: TaskStatus[];
}
