import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class MetaPageCategory {
  @Field()
  id: string;

  @Field()
  name: string;
}

@InputType()
export class PluginMetaConnectPagesInput {
  @Field()
  @IsString()
  accessToken: string;
}

export enum PluginMetaPageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(PluginMetaPageStatus, {
  name: 'MetaPageStatus',
  description: 'Status of the Meta Page connection',
});

export interface PluginMetaPage {
  id: string;
  name: string;
  accessToken: string;
  tasks: string[];
  category: string;
  categories: { id: string; name: string }[];
}

export enum PluginMetaMessageType {
  MESSAGE = 'MESSAGE',
  MESSAGE_DELIVERY = 'MESSAGE_DELIVERY',
  READED = 'READED',
}

registerEnumType(PluginMetaMessageType, {
  name: 'MetaMessageType',
  description: 'Type of the Meta Page message',
});

export enum PluginMetaPageInfoStatus {
  CONNECTED = 'CONNECTED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTED_WITH_OTHER_WORKSPACE = 'CONNECTED_WITH_OTHER_WORKSPACE',
}

registerEnumType(PluginMetaPageInfoStatus, {
  name: 'MetaPageInfoStatus',
  description: 'Connection status of the Meta Page',
});

@ObjectType('MetaPageInfo')
export class PluginMetaPageInfo {
  @Field()
  pageId: string;

  @Field()
  name: string;

  @Field(() => [MetaPageCategory])
  categories: MetaPageCategory[];

  accessToken: string;

  @Field(() => PluginMetaPageInfoStatus)
  status: PluginMetaPageInfoStatus;

  @Field({ nullable: true })
  avatar?: string;
}

export interface ForwardMetaWebhookDto {
  domain: string;
  data: any;
}
