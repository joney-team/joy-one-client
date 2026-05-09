import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import {
  EventChannel,
  EventDataActionType,
  EventType,
  EventVariant,
} from './events.types';
import { ReportTimeSeriesInput } from '../reports/reports.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from '../graphql/graphql-type';

@ObjectType('Event')
@Entity('events')
export class EventEntity extends BaseMongoEntity {
  @Field(() => EventChannel, { nullable: true })
  @Column()
  channel?: EventChannel;

  @Field(() => EventType)
  @Column()
  type: EventType;

  @Field(() => Number)
  @Column()
  time: number;

  @Field(() => EventDataActionType, { nullable: true })
  @Column()
  actionType?: EventDataActionType;

  @Field({ nullable: true })
  @Column()
  userId?: string;

  @Field({ nullable: true })
  @Column()
  ref?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  data?: any;

  @Field({ nullable: true })
  @Column()
  persist?: boolean;

  @Field(() => EventVariant, { nullable: true })
  @Column()
  variant?: EventVariant;

  @Field(() => String, { nullable: true })
  @Column()
  sessionId?: string;

  @Column()
  reportTimeRange?: ReportTimeSeriesInput;
}
