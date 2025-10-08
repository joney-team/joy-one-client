import { WorkspaceType } from "@/modules/workspaces/workspaces-types";

export enum PluginEInvoicesProvider {
  MATBAO = "MATBAO",
}

export enum PluginEInvoiceTemplateType {
  LOAN_RECEIPT = "LOAN_RECEIPT",
  ORDER_RECEIPT = "ORDER_RECEIPT",
}

export type PluginEInvoiceTemplateField = { id: string } & Partial<{
  type: "input" | "variable";
  value: string | null;
  fieldName: string | null;
  variable: string | null;
  children: Omit<PluginEInvoiceTemplateField, "children">[];
}>;

export interface PluginEInvoiceTemplate {
  fields: Partial<PluginEInvoiceTemplateField>[];
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
  provider: PluginEInvoicesProvider;
  providerAuth: PluginEInvoicesProviderAuth;
  templates: Partial<PluginEInvoiceTemplates>;
  status: PluginEInvoicesProviderStatus;
}

export interface PluginEInvoiceTemplateVariable {
  name?: string;
  description?: string;
  childVariables?: Record<string, PluginEInvoiceTemplateVariable>;
  workspaceTypes?: WorkspaceType[];
}

export interface PluginEInvoiceTemplateVariables {
  [key: string]: PluginEInvoiceTemplateVariable;
}
