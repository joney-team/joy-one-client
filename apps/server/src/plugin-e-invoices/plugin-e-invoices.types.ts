import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { CustomerKycEntity } from '../customer-kycs/customer-kycs.entity';
import { CustomerEntity } from '../customers/customers.entity';
import { LoanEntity } from '../loans/entities/loan.entity';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { ReceiptsService } from '../receipts/receipts.service';
import { WorkspaceSettingEntity } from '../workspace-settings/entities/workspace-setting.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';

export enum PluginEInvoicesProviderType {
  MATBAO = 'MATBAO',
  MATBAO_DEMO = 'MATBAO_DEMO',
}

registerEnumType(PluginEInvoicesProviderType, {
  name: 'PluginEInvoicesProviderType',
  description: 'Available plugin e-invoices provider types',
});

export enum PluginEInvoiceTemplateType {
  LOAN_INCOME_RECEIPT = 'LOAN_INCOME_RECEIPT',
  ORDER_INCOME_RECEIPT = 'ORDER_INCOME_RECEIPT',
}

export type PluginEInvoiceTemplateField = {
  id: string;
  type: 'input' | 'variable';
  value: string | null;
  fieldName: string | null;
  variable?: string | null;
  children?: Omit<PluginEInvoiceTemplateField, 'children'>[];
};

export enum PluginEInvoiceTemplateAutoCreateMode {
  NONE = 'NONE',
  EXPIRE_TIME = 'EXPIRE_TIME',
}

export enum PluginEInvoiceTemplateCreateCriteria {
  NONE = 'NONE',
  PROFIT_MORE_THAN_ZERO = 'PROFIT_MORE_THAN_ZERO',
}

export interface PluginEInvoiceTemplate {
  fields: PluginEInvoiceTemplateField[];
  autoCreateMode?: PluginEInvoiceTemplateAutoCreateMode;
  createCriteria?: PluginEInvoiceTemplateCreateCriteria;
}

export type PluginEInvoiceTemplates = Partial<
  Record<PluginEInvoiceTemplateType, PluginEInvoiceTemplate>
>;

export enum PluginEInvoiceProviderStatus {
  ACTIVE = 'ACTIVE',
  AUTH_FAILED = 'AUTH_FAILED',
  INACTIVE = 'INACTIVE',
}

registerEnumType(PluginEInvoiceProviderStatus, {
  name: 'PluginEInvoicesProviderStatus',
  description: 'Status of the plugin e-invoices provider',
});

export type MatBaoAuth = {
  MST: string;
  TDNhap: string;
  MKhau: string;
};

export type PluginEInvoicesProviderAuth = MatBaoAuth;

@InputType()
export class CreatePluginEInvoiceProviderInput {
  @Field(() => PluginEInvoicesProviderType)
  @IsEnum(PluginEInvoicesProviderType)
  type: PluginEInvoicesProviderType;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  auth: PluginEInvoicesProviderAuth;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  templates: PluginEInvoiceTemplates;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  apiUrl?: string;
}

@InputType()
export class UpdatePluginEInvoiceProviderInput {
  @Field(() => PluginEInvoicesProviderType, { nullable: true })
  @IsEnum(PluginEInvoicesProviderType)
  @IsOptional()
  type?: PluginEInvoicesProviderType;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  auth?: PluginEInvoicesProviderAuth;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  templates?: PluginEInvoiceTemplates;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  apiUrl?: string;
}

@InputType()
export class GenerateEInvoiceDataInput {
  @Field()
  @IsString()
  receiptId: string;
}

export interface GenerateEInvoiceDataContext {
  serviceReceipts: ReceiptsService;
  templateType: PluginEInvoiceTemplateType;
  workspace: WorkspaceEntity;
  workspaceSetting: WorkspaceSettingEntity;
  receipt: ReceiptEntity;
  loan?: LoanEntity;
  customer?: CustomerEntity;
  customerKyc?: CustomerKycEntity;
}
