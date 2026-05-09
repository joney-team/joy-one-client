import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLAnyType } from 'src/graphql/graphql-type';

export enum MessageAttachmentType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  UNKNOWN = 'UNKNOWN',
  STICKER = 'STICKER',
}

registerEnumType(MessageAttachmentType, {
  name: 'MessageAttachmentType',
  description: 'Type of the message attachment',
});

export enum MessageType {
  RECEIVE = 'RECEIVE',
  SEND = 'SEND',
}

registerEnumType(MessageType, {
  name: 'MessageType',
  description: 'Type of the message',
});

@ObjectType()
export class MessageAttachment {
  @Field(() => MessageAttachmentType)
  type: MessageAttachmentType;

  @Field({ nullable: true })
  url?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  raw?: any;
}

export interface AddMessageInput {
  id?: string;
  type: MessageType;
  workspaceId: string;
  senderId: string;
  userId?: string;
  text?: string;
  attachments?: MessageAttachment[];
  resource: MessageResource;
  resouceId?: string;
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  READED = 'READED',
  SENT_FAILED = 'SENT_FAILED',
}

registerEnumType(MessageStatus, {
  name: 'MessageStatus',
  description: 'Status of the message',
});

export enum MessageResource {
  WEBHOOK = 'webhook',
  INTERNAL = 'internal',
  AI_ASSISTANT = 'ai-assistant',
}

registerEnumType(MessageResource, {
  name: 'MessageResource',
  description: 'The resource from which the message is sent',
});
