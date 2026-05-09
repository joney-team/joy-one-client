import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { AddMessageInput, MessageResource } from './messages.types';

export enum MessageBoxPlatformType {
  ZALO = 'ZALO',
  META_PAGE = 'META_PAGE',
  MESSAGE_HUB = 'MESSAGE_HUB',
}

registerEnumType(MessageBoxPlatformType, {
  name: 'MessageBoxPlatformType',
  description: 'Platform type of the message box',
});

export enum MessageBoxStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(MessageBoxStatus, {
  name: 'MessageBoxStatus',
  description: 'Status of the message box',
});

export type GetSenderInfoResult = {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
};

export interface AddMessageToBoxInput extends AddMessageInput {
  workspaceId: string;
  platformId: string;
  platformType: MessageBoxPlatformType;
  senderName?: string;
  senderAvatar?: string;
  customerId?: string;
  createdAt?: number;
  getSenderInfo?: () => Promise<GetSenderInfoResult>;
  aiAssistantconversationId?: string;
}

@InputType()
export class SendTextMessageInput {
  @Field()
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  resouce?: MessageResource;

  @IsString()
  @IsOptional()
  aiAssistantMessageId?: string;
}

@InputType()
export class SendImageMessageInput {
  @Field()
  @IsString()
  url: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  text?: string;
}

@InputType()
export class SendFileMessageInput {
  @Field()
  @IsString()
  url: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  text?: string;
}

export interface NotifyNewMessageBoxToZaloGmfGroup {
  messageBoxId: string;
  workspaceId: string;
}

@ObjectType()
export class MessageBoxPlatform {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => MessageBoxPlatformType)
  type: MessageBoxPlatformType;

  @Field({ nullable: true })
  image?: string;

  @Field()
  enabled: boolean;
}
