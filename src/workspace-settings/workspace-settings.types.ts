import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  WorkingDayInterval,
  WorkingDayIntervalInput,
} from '../app.generic-types';
import { AppEntity } from '../app.types';
import { GraphQLJSONObject } from '../graphql/graphql-type';
import { LoanSettings, LoanSettingsInput } from '../loans/loans.types';
import {
  PluginBankAccount,
  PluginBankAccountInput,
} from '../plugin-banks/plugin-banks.types';
import {
  MailerAccount,
  MailerAccountInput,
} from '../plugin-mailer/plugin-mailer.types';
import { ZaloOaGmfGroupSettings } from '../plugin-zalo-oas/plugin-zalo-oas.types';
import { ReceiptPaymentMethod } from '../receipts/receipts.types';
import { TaskStatus } from '../tasks/tasks.types';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';

@ObjectType()
export class WorkspaceSearchSettings {
  @Field(() => [String], { nullable: true })
  hideEntities?: AppEntity[];
}

@InputType()
export class WorkspaceSearchSettingsInput {
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hideEntities?: AppEntity[];
}

@ObjectType()
export class DisplayWidget {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  state?: unknown;
}

@InputType()
export class DisplayWidgetInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  type: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  state?: unknown;
}

@ObjectType()
export class WorkspaceViewComponent {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  moduleId?: string;

  @Field({ nullable: true })
  dividerName?: string;
}

@InputType()
export class WorkspaceViewComponentInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String)
  @IsString()
  type: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  moduleId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  dividerName?: string;
}

@ObjectType()
export class WorkspaceMenuComponent {
  @Field({ nullable: true })
  id: string;

  @Field(() => String)
  type: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  moduleId?: string;

  @Field({ nullable: true })
  dividerName?: string;
}

@ObjectType()
export class WorkspaceView {
  @Field(() => [WorkspaceViewComponent], { nullable: true })
  menu?: WorkspaceViewComponent[];

  @Field(() => [DisplayWidget], { nullable: true })
  dashboardWidgets?: DisplayWidget[];

  @Field(() => [DisplayWidget], { nullable: true })
  reportWidgets?: DisplayWidget[];
}

@InputType()
export class WorkspaceViewInput {
  @Field(() => [WorkspaceViewComponentInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkspaceViewComponentInput)
  @IsOptional()
  menu?: WorkspaceViewComponentInput[];

  @Field(() => [DisplayWidgetInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisplayWidgetInput)
  @IsOptional()
  dashboardWidgets?: DisplayWidget[];

  @Field(() => [DisplayWidgetInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisplayWidgetInput)
  @IsOptional()
  reportWidgets?: DisplayWidget[];
}

export class SetWorkspaceSettingsDto {
  @ApiProperty()
  @IsObject()
  @IsOptional()
  bankAccount?: PluginBankAccount;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  mailer?: MailerAccount;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  memberPermissions?: WorkspacePermission[];

  @IsBoolean()
  @IsOptional()
  allowPayTicketMultipleTimes?: boolean;

  @IsBoolean()
  @IsOptional()
  allowTip?: boolean;

  @IsBoolean()
  @IsOptional()
  allowDuplicateBookings?: boolean;

  @IsBoolean()
  @IsOptional()
  receiptImagesRequired?: boolean;

  @IsEnum(ReceiptPaymentMethod)
  @IsOptional()
  receiptPaymentMethodDefault?: ReceiptPaymentMethod;

  @IsNumber()
  @IsOptional()
  bookingsAutoRemindCustomerBookingBeforeDays?: number;

  @IsString()
  @IsOptional()
  bookingsAutoRemindCustomerBookingTime?: string;

  @IsArray()
  @IsOptional()
  taskStatuses?: TaskStatus[];

  @IsObject()
  @IsOptional()
  loanSettings?: LoanSettings;

  @IsString()
  @IsOptional()
  termsOfService?: string;

  @IsString()
  @IsOptional()
  privacyPolicy?: string;

  @IsObject()
  @IsOptional()
  view?: WorkspaceView;

  @IsObject()
  @IsOptional()
  searchSettings?: WorkspaceSearchSettings;

  @IsString()
  @IsOptional()
  currencyCode?: string;

  @IsBoolean()
  @IsOptional()
  isAuthSessionRestricted?: boolean;

  @IsObject()
  @IsOptional()
  zaloOaGmfGroupSettings?: ZaloOaGmfGroupSettings;
}

@ObjectType()
export class WorkspaceSchedule {
  @Field({ nullable: true })
  timezone?: string;

  @Field(() => [WorkingDayInterval])
  workingDays: WorkingDayInterval[];
}

@InputType()
export class WorkspaceScheduleInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  timezone?: string;

  @Field(() => [WorkingDayIntervalInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingDayIntervalInput)
  workingDays: WorkingDayIntervalInput[];
}

@InputType()
export class UpdateWorkspaceSettingInput {
  @Field({ nullable: true })
  @Type(() => WorkspaceScheduleInput)
  @ValidateNested()
  @IsOptional()
  schedule?: WorkspaceScheduleInput;

  @Field(() => PluginBankAccountInput, { nullable: true })
  @Type(() => PluginBankAccountInput)
  @ValidateNested()
  @IsOptional()
  bankAccount?: PluginBankAccountInput;

  @Field(() => MailerAccountInput, { nullable: true })
  @Type(() => MailerAccountInput)
  @ValidateNested()
  @IsOptional()
  mailer?: MailerAccountInput;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  bookingsAutoRemindCustomerBookingBeforeDays?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowTip?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowDuplicateBookings?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  memberPermissions?: WorkspacePermission[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bookingsAutoRemindCustomerBookingTime?: string;

  @Field(() => LoanSettingsInput, { nullable: true })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LoanSettingsInput)
  loanSettings?: LoanSettingsInput;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  termsOfService?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  privacyPolicy?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  receiptImagesRequired?: boolean;

  @Field(() => ReceiptPaymentMethod, { nullable: true })
  @IsEnum(ReceiptPaymentMethod)
  @IsOptional()
  receiptPaymentMethodDefault?: ReceiptPaymentMethod;

  @Field(() => WorkspaceViewInput, { nullable: true })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceViewInput)
  view?: WorkspaceViewInput;

  @Field(() => WorkspaceSearchSettingsInput, { nullable: true })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceSearchSettingsInput)
  searchSettings?: WorkspaceSearchSettingsInput;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currencyCode?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isAuthSessionRestricted?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  zaloOaGmfGroupSettings?: ZaloOaGmfGroupSettings;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowPayTicketMultipleTimes?: boolean;
}
