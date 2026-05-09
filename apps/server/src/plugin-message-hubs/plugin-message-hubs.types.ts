import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseMongoEntity } from '../database/database.entities';
import { MessageAttachment } from '../message-boxes/messages.types';

export enum MessageHubWidgetWelcomeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  NAME = 'NAME',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

registerEnumType(MessageHubWidgetWelcomeType, {
  name: 'ChannelWidgetWelcomeInputType',
  description: 'Type of welcome input in channel widget',
});

@ObjectType()
export class MessageHubWidgetWelcome {
  @Field()
  id: string;

  @Field(() => MessageHubWidgetWelcomeType)
  type: MessageHubWidgetWelcomeType;

  @Field({ nullable: true })
  isRequired?: boolean;

  @Field()
  label: string;

  @Field()
  fieldName: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  placeholder?: string;
}

@InputType()
export class MessageHubWidgetWelcomeInput {
  @Field()
  @IsString()
  id: string;

  @Field(() => MessageHubWidgetWelcomeType)
  @IsEnum(MessageHubWidgetWelcomeType)
  type: MessageHubWidgetWelcomeType;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @Field()
  @IsString()
  label: string;

  @Field()
  @IsString()
  fieldName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  placeholder?: string;
}

export enum MessageHubWidgetPosition {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

registerEnumType(MessageHubWidgetPosition, {
  name: 'MessageHubWidgetPosition',
  description: 'Position of the widget on the client screen',
});

@ObjectType()
export class MessageHubWidgetSettings {
  @Field({ nullable: true })
  color?: string;

  @Field(() => MessageHubWidgetPosition, { nullable: true })
  position?: MessageHubWidgetPosition;

  @Field({ nullable: true })
  chatIcon?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field({ nullable: true })
  brandName?: string;

  @Field({ nullable: true })
  brandLogo?: string;

  @Field({ nullable: true })
  welcomMessage?: string;

  @Field({ nullable: true })
  welcomSubMessage?: string;

  @Field(() => [MessageHubWidgetWelcome], { nullable: true })
  welcomeInputs?: MessageHubWidgetWelcome[];
}

@InputType()
export class ChannelWidgetSettingsInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => MessageHubWidgetPosition, { nullable: true })
  @IsObject()
  @IsOptional()
  position?: MessageHubWidgetPosition;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  chatIcon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  locale?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  brandName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  brandLogo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  welcomMessage?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  welcomSubMessage?: string;

  @Field(() => [MessageHubWidgetWelcomeInput], { nullable: true })
  @IsArray()
  @IsOptional()
  welcomeInputs?: MessageHubWidgetWelcomeInput[];
}

@InputType()
export class PluginMessageHubInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ChannelWidgetSettingsInput)
  @IsObject()
  widgetSettings: ChannelWidgetSettingsInput;
}

@ObjectType()
export class PluginMessageHubScript {
  @Field()
  src: string;

  @Field()
  html: string;
}

@ObjectType()
export class PluginMessageHubDirect {
  @Field()
  src: string;
}

@ObjectType()
export class PluginMessageHub {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  ref?: string;

  @Field()
  webhookUrl: string;

  @Field(() => MessageHubWidgetSettings)
  widgetSettings: MessageHubWidgetSettings;

  @Field(() => PluginMessageHubScript)
  script: PluginMessageHubScript;

  @Field(() => PluginMessageHubDirect)
  direct: PluginMessageHubDirect;
}

export type PluginMessageHubMessageType = 'CHANNEL' | 'CLIENT';

export interface PluginMessageHubMessage extends BaseMongoEntity {
  type: PluginMessageHubMessageType;
  channelId: string;
  clientId: string;
  text?: string;
  attachments: MessageAttachment[];
}

export interface PluginMessageHubWebhook {
  type: string;
  channelId: string;
  data?: PluginMessageHubMessage;
}

export interface ChannelSendMessageDto {
  clientId: string;
  text?: string;
  attachments?: MessageAttachment[];
}

export interface MessageHubClient {
  channelId: string;
  userAgent?: string;
  data?: any;
  lastActiveAt: number;
}
