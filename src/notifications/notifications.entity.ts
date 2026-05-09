import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { Column, Entity } from 'typeorm';
import {
  NotificationIcon,
  NotificationStatus,
  NotificationType,
} from './notifications.types';

@ObjectType('Notification')
@Entity('notifications')
export class NotificationEntity extends BaseMongoEntity {
  @Field(() => NotificationIcon, { nullable: true })
  @Column()
  icon?: NotificationIcon;

  @Field()
  @Column()
  title: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  titleParams?: any;

  @Field()
  @Column()
  body: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  bodyParams?: any;

  @Column()
  userId: string;

  @Column()
  workspaceId: string;

  @Field({ nullable: true })
  @Column()
  route?: string;

  @Field({ nullable: true })
  @Column()
  image?: string;

  @Field(() => NotificationType)
  @Column()
  type: NotificationType;

  @Field(() => NotificationStatus)
  @Column()
  status: NotificationStatus;
}
