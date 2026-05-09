import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import {
  MessageAttachment,
  MessageResource,
  MessageStatus,
  MessageType,
} from '../messages.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Message')
@Entity('messages')
export class MessageEntity extends BaseMongoEntity {
  @Field(() => MessageType)
  @Column()
  type: MessageType;

  @Field()
  @Column()
  boxId: string;

  @Field({ nullable: true })
  @Column()
  id?: string;

  @Field({ nullable: true })
  @Column()
  userId?: string;

  @Field({ nullable: true })
  @Column()
  senderId?: string;

  @Field({ nullable: true })
  @Column()
  text?: string;

  @Field(() => MessageResource, { nullable: true })
  @Column()
  resource?: MessageResource;

  @Field({ nullable: true })
  @Column()
  resouceId?: string;

  @Field(() => [MessageAttachment])
  @Column()
  attachments: MessageAttachment[];

  @Field(() => MessageStatus, { nullable: true })
  @Column()
  status?: MessageStatus;

  @Field({ nullable: true })
  @Column()
  failedReason?: string;
}
