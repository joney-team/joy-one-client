import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { TaskContextType } from '../tasks.types';

@Entity('task-metrics')
export class TaskMetricsEntity extends BaseMongoEntity {
  @Column()
  contextType: TaskContextType;

  @Column({ nullable: true })
  contextId: string | null;

  @Column({ nullable: true })
  estimatedTime: number | null;

  @Column()
  progress: number | null;

  @Column()
  totalTasks: number | null;

  @Column()
  inProgressTasks: number | null;

  @Column()
  startDate: number | null;

  @Column()
  dueDate: number | null;

  @Column()
  overdueTasks: number | null;
}

@ObjectType()
export class TaskMetrics {
  @Field(() => TaskContextType)
  contextType: TaskContextType;

  @Field(() => String, { nullable: true })
  contextId: string | null;

  @Field(() => Number, { nullable: true })
  estimatedTime: number | null;

  @Field(() => Number, { nullable: true })
  progress: number | null;

  @Field(() => Number, { nullable: true })
  totalTasks: number | null;

  @Field(() => Number, { nullable: true })
  inProgressTasks: number | null;

  @Field(() => Number, { nullable: true })
  startDate: number | null;

  @Field(() => Number, { nullable: true })
  dueDate: number | null;

  @Field(() => Number, { nullable: true })
  overdueTasks: number | null;
}
