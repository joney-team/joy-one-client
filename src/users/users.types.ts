import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AppLocale } from '../lang/lang.types';

@ObjectType()
export class UserSettings {
  @Field(() => AppLocale, { nullable: true })
  locale?: AppLocale;

  @Field(() => String, { nullable: true })
  timezoneId?: string;

  @Field(() => String, { nullable: true })
  timezoneUtc?: string;

  @Field(() => Boolean, { nullable: true })
  isStartOfWeekSunday?: boolean;

  @Field(() => Boolean, { nullable: true })
  isTwelveHour?: boolean;
}

@InputType()
export class UserSettingsInput {
  @Field(() => AppLocale, { nullable: true })
  @IsEnum(AppLocale)
  @IsOptional()
  locale?: AppLocale;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  timezoneId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  timezoneUtc?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isStartOfWeekSunday?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isTwelveHour?: boolean;
}

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  plainPassword?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  BUSINESS_PARTNER = 'BUSINESS_PARTNER',
  SYS_ADMIN = 'SYS_ADMIN',
  TESTER = 'TESTER',
  MEMBER = 'MEMBER',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Available roles of a user',
});

@InputType()
export class UpdateUserProfileInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatar?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  birthday?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => UserSettingsInput, { nullable: true })
  @ValidateNested()
  @Type(() => UserSettingsInput)
  @IsOptional()
  settings?: UserSettingsInput;
}

export interface UserClient {
  userId: string;
  workspaceId?: string;
  deviceId: string;
}

export interface UserClients {
  [socketId: string]: UserClient;
}

@ObjectType()
export class UserAuthProvider {
  @Field(() => String)
  uid: string;

  @Field({ nullable: true })
  providerId?: string;

  @Field({ nullable: true })
  username?: string;
}

export class UpdateUserRefCodeInput {
  @ApiProperty()
  @IsString()
  refCode: string;
}

@InputType()
export class SetUserLocaleInput {
  @Field(() => AppLocale, { nullable: true })
  @IsEnum(AppLocale)
  @IsOptional()
  locale?: AppLocale;
}

export enum UserType {
  USER = 'USER',
  APP = 'APP',
}

export class UserAppDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}

export enum UserConnectionStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

@InputType()
export class UpdateUserPasswordInput {
  @Field()
  @IsString()
  plainPassword: string;

  @Field()
  @IsString()
  password?: string;
}
