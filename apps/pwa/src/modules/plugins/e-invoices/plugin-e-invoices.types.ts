import { WorkspaceType } from "@/modules/workspaces/workspaces-types";

export enum PluginEInvoicesProviderType {
  MATBAO = "MATBAO",
  MATBAO_DEMO = "MATBAO_DEMO",
}

export enum PluginEInvoiceTemplateType {
  LOAN_INCOME_RECEIPT = "LOAN_INCOME_RECEIPT",
  ORDER_INCOME_RECEIPT = "ORDER_INCOME_RECEIPT",
}

export type PluginEInvoiceTemplateField = {
  id: string;
  type: "input" | "variable";
  value: string | null;
  fieldName: string | null;
  variable?: string | null;
  children?: Omit<PluginEInvoiceTemplateField, "children">[];
};

export interface PluginEInvoiceTemplate {
  fields: PluginEInvoiceTemplateField[];
}

export type PluginEInvoiceTemplates = Partial<
  Record<PluginEInvoiceTemplateType, PluginEInvoiceTemplate>
>;

export enum PluginEInvoicesProviderStatus {
  ACTIVE = "ACTIVE",
  AUTH_FAILED = "AUTH_FAILED",
  INACTIVE = "INACTIVE",
}

export type MatBaoAuth = {
  MST: string;
  TDNhap: string;
  MKhau: string;
};

export type PluginEInvoicesProviderAuth = Partial<MatBaoAuth>;

export interface PluginEInvoicesProviderDto {
  type: PluginEInvoicesProviderType;
  auth: PluginEInvoicesProviderAuth;
  templates: Partial<PluginEInvoiceTemplates>;
  status: PluginEInvoicesProviderStatus;
}

export interface PluginEInvoiceTemplateVariable {
  name?: string;
  description?: string;
  isNumerical?: true;
  childVariables?: Record<string, PluginEInvoiceTemplateVariable>;
  templateTypes?: PluginEInvoiceTemplateType[];
  workspaceTypes?: WorkspaceType[];
}

export interface PluginEInvoiceTemplateVariables {
  [key: string]: PluginEInvoiceTemplateVariable;
}

export interface PluginEInvoicesProviderInformation {
  name: string;
  apiUrl: string;
  logo: string;
  isBeta?: boolean;
  defaultTemplates?: PluginEInvoiceTemplates;
}

export type PluginEInvoicesProviderInformations = Record<
  PluginEInvoicesProviderType,
  PluginEInvoicesProviderInformation
>;
