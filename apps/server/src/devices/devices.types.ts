import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppLocale } from '../lang/lang.types';

@InputType()
export class RegisterDeviceInput {
  @Field(() => String)
  @IsString()
  identifyId: string;

  @Field(() => AppLocale, { nullable: true })
  @IsEnum(AppLocale)
  @IsOptional()
  locale?: AppLocale;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  deviceName?: string;
}

@InputType()
export class SetDeviceNotificationTokenInput {
  @Field(() => String)
  @IsString()
  notificationToken: string;
}

@InputType()
export class SetDeviceLocaleInput {
  @Field(() => AppLocale)
  @IsEnum(AppLocale)
  locale: AppLocale;
}

@ObjectType()
export class DeviceBrowser {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  version?: string;
}

@ObjectType()
export class DeviceInformation {
  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  vendor?: string;
}

@ObjectType()
export class DeviceEngine {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  version?: string;
}

@ObjectType()
export class DeviceIOS {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  version?: string;
}

@ObjectType()
export class DeviceCPU {
  @Field({ nullable: true })
  architecture?: string;
}

@ObjectType()
export class DeviceUserAgent {
  @Field()
  ua: string;

  @Field(() => DeviceBrowser)
  browser: DeviceBrowser;

  @Field(() => DeviceInformation)
  device: DeviceInformation;

  @Field(() => DeviceEngine)
  engine: DeviceEngine;

  @Field(() => DeviceIOS)
  os: DeviceIOS;

  @Field(() => DeviceCPU)
  cpu: DeviceCPU;
}
