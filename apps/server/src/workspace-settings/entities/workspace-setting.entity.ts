import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { GraphQLJSONObject } from '../../graphql/graphql-type';
import { LoanSettings } from '../../loans/loans.types';
import { PluginBankAccount } from '../../plugin-banks/plugin-banks.types';
import { MailerAccount } from '../../plugin-mailer/plugin-mailer.types';
import { ZaloOaGmfGroupSettings } from '../../plugin-zalo-oas/plugin-zalo-oas.types';
import { ReceiptPaymentMethod } from '../../receipts/receipts.types';
import { WorkspacePermission } from '../../workspace-roles/workspace-roles.types';
import {
  WorkspaceSchedule,
  WorkspaceSearchSettings,
  WorkspaceView,
} from '../workspace-settings.types';

@ObjectType('WorkspaceSetting')
@Entity('workspace-settings')
@Unique('workspace-settings-unique', ['workspaceId'])
export class WorkspaceSettingEntity extends BaseMongoEntity {
  @Field({ nullable: true })
  @Column()
  schedule?: WorkspaceSchedule;

  @Field(() => PluginBankAccount, { nullable: true })
  @Column()
  bankAccount?: PluginBankAccount;

  @Field(() => MailerAccount, { nullable: true })
  @Column()
  mailer?: MailerAccount;

  @Field({ nullable: true })
  @Column()
  bookingsAutoRemindCustomerBookingBeforeDays: number;

  @Field({ nullable: true })
  @Column()
  allowTip?: boolean;

  @Field({ nullable: true })
  @Column()
  allowDuplicateBookings?: boolean;

  @Field(() => [String], { nullable: true })
  @Column()
  memberPermissions?: WorkspacePermission[];

  @Field({ nullable: true })
  @Column()
  bookingsAutoRemindCustomerBookingTime?: string;

  @Field(() => LoanSettings, { nullable: true })
  @Column()
  loanSettings?: LoanSettings;

  @Field({ nullable: true })
  @Column()
  termsOfService?: string;

  @Field({ nullable: true })
  @Column()
  privacyPolicy?: string;

  @Field({ nullable: true })
  @Column()
  receiptImagesRequired?: boolean;

  @Field(() => ReceiptPaymentMethod, { nullable: true })
  @Column()
  receiptPaymentMethodDefault?: ReceiptPaymentMethod;

  @Field(() => WorkspaceView, { nullable: true })
  @Column()
  view?: WorkspaceView;

  @Field(() => WorkspaceSearchSettings, { nullable: true })
  @Column()
  searchSettings?: WorkspaceSearchSettings;

  @Field({ nullable: true })
  @Column()
  currencyCode?: string;

  @Field({ nullable: true })
  @Column()
  isAuthSessionRestricted?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  zaloOaGmfGroupSettings?: ZaloOaGmfGroupSettings;

  @Field({ nullable: true })
  @Column()
  allowPayTicketMultipleTimes?: boolean;
}
