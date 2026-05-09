import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PluginAiAssistantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(PluginAiAssistantStatus, {
  name: 'PluginAiAssistantStatus',
  description: 'Status of the AI assistant plugin',
});

export enum PluginAiAssistantProvider {
  DIFY = 'DIFY',
  VONIC_DIFY = 'VONIC_DIFY',
}

registerEnumType(PluginAiAssistantProvider, {
  name: 'PluginAiAssistantProvider',
  description: 'Provider of the AI assistant plugin',
});

@InputType()
export class PluginAiAssistantInput {
  @Field(() => PluginAiAssistantProvider)
  @IsEnum(PluginAiAssistantProvider)
  provider: PluginAiAssistantProvider;

  @Field(() => String)
  @IsString()
  apiKey: string;
}

@InputType()
export class CreatePluginAiAssistantInput extends PluginAiAssistantInput {}

@InputType()
export class UpdatePluginAiAssistantInput {
  @Field(() => PluginAiAssistantProvider, { nullable: true })
  @IsEnum(PluginAiAssistantProvider)
  @IsOptional()
  provider?: PluginAiAssistantProvider;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @Field()
  @IsBoolean()
  enabled: boolean;
}

export interface PluginAiAssistantResponseMessageBoxInput {
  messageBoxId: string;
  workspaceId: string;
}
