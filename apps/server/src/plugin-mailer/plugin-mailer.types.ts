import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { WorkspaceEntity } from 'src/workspaces/entities/workspace.entity';
import { AppLocale } from '../lang/lang.types';
import { UserEntity } from '../users/entities/user.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceMailTemplate } from './templates/plugin-mailer.workspace-templates';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

export class PluginMailerSendUserDto {
  @IsString()
  @IsOptional()
  userId: string | UserEntity;

  @IsString()
  @IsOptional()
  locale?: AppLocale;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  template?: WorkspaceMailTemplate;

  @IsObject()
  @IsOptional()
  params?: any;
}

export class PluginMailerSendWorkspaceDto {
  @IsString()
  @IsOptional()
  workspace: WorkspaceEntity | string;

  @IsEnum(AppLocale)
  @IsOptional()
  locale?: AppLocale;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  template?: WorkspaceMailTemplate;

  @IsObject()
  @IsOptional()
  params?: any;

  @IsEmail()
  to?: string;
}

export class PluginMailerSendInternalWorkspace extends PluginMailerSendWorkspaceDto {
  @IsBoolean()
  @IsOptional()
  isAdminOnly?: boolean;

  @IsEnum(WorkspacePermission)
  @IsOptional()
  permission?: WorkspacePermission;

  @IsArray()
  @IsOptional()
  userIds?: string[];
}

@ObjectType()
export class MailerAccount {
  @Field()
  user: string;

  @Field()
  pass: string;
}

@InputType()
export class MailerAccountInput {
  @Field()
  @IsString()
  user: string;

  @Field()
  @IsString()
  pass: string;
}

export class SendMailInput {
  account?: MailerAccountInput;
  from?: string;
  fromName?: string;
  to?: string;
  subject: string;
  text?: string;
  html?: string;
  params?: any;
}

@InputType()
export class TestSendMailInput {
  @Field()
  @IsEmail()
  to: string;

  @Field()
  @IsString()
  accountUser: string;

  @Field()
  @IsString()
  accountPass: string;
}
