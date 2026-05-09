import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocationInput } from 'src/locations/locations.types';
import { AppLocale } from '../lang/lang.types';
import type { WorkspaceSettingEntity } from '../workspace-settings/entities/workspace-setting.entity';

export class UnassignWorkspaceRoleDto {
  @ApiProperty()
  @IsString()
  userId: string;
}

export enum WorkspaceType {
  SOFTWARE = 'SOFTWARE',
  BUSINESS = 'BUSINESS',
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
  DENTAL = 'DENTAL',
  SPA = 'SPA',
  BEAUTY_SALON = 'BEAUTY_SALON',
  CREDIT = 'CREDIT',
}

registerEnumType(WorkspaceType, {
  name: 'WorkspaceType',
  description: 'Available workspace types',
});

@InputType()
export class WorkspaceInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => WorkspaceType)
  @IsEnum(WorkspaceType)
  type: WorkspaceType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  location?: LocationInput;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  hotline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  appIcon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  appDomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  appName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  appColor?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  appColorShape?: number;

  @Field(() => AppLocale, { nullable: true })
  @IsEnum(AppLocale)
  @IsOptional()
  locale?: AppLocale;
}

@InputType()
export class CreateWorkspaceInput extends WorkspaceInput {
  @Field()
  @IsString()
  code: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  refCode?: string;
}

export interface WorkspaceMemberInvitation {
  workspace: {
    _id: string;
    name: string;
    logo: string;
    hotline: string;
    type: WorkspaceType;
  };
  inviter: {
    name: string;
    avatar?: string;
    phone?: string;
  };
  expireAt: number;
}

@ObjectType()
export class WorkspaceInviteInformation {
  @Field()
  workspaceId: string;

  @Field(() => WorkspaceType)
  type: WorkspaceType;

  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  hotline?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  appColor?: string;
}

export interface WorkspaceSetup {
  settings: WorkspaceSettingEntity;
}
