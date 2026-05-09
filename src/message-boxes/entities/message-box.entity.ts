import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  MessageBoxPlatformType,
  MessageBoxStatus,
} from '../message-boxes.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('MessageBox')
@Entity('message-boxes')
@Unique('message-boxes-unique', ['ref'])
export class MessageBoxEntity extends BaseMongoEntity {
  @Field()
  @Column()
  ref: string;

  @Field()
  @Column()
  senderId: string;

  @Field({ nullable: true })
  @Column()
  senderName?: string;

  @Field({ nullable: true })
  @Column()
  senderAvatar?: string;

  @Field({ nullable: true })
  @Column()
  customerId?: string;

  @Field({ nullable: true })
  @Column()
  assigneeUserId?: string;

  @Field({ nullable: true })
  @Column()
  platformId?: string;

  @Field({ nullable: true })
  @Column()
  phone?: string;

  @Field(() => MessageBoxPlatformType)
  @Column()
  platformType: MessageBoxPlatformType;

  @Field({ nullable: true })
  @Column()
  lastInteractionAt?: number;

  @Field({ nullable: true })
  @Column()
  expireAt?: number;

  @Field(() => MessageBoxStatus, { nullable: true })
  @Column()
  status?: MessageBoxStatus;

  @Field({ nullable: true })
  @Column()
  aiAssistantconversationId?: string;

  @Field({ nullable: true })
  @Column()
  aiAssistantDisabled?: boolean;
}
