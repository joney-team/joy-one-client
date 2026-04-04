import { WorkspaceType } from "@/graphql/types.graphql";

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

export enum PluginEInvoiceTemplateAutoCreateMode {
  NONE = "NONE",
  EXPIRE_TIME = "EXPIRE_TIME",
}

export enum PluginEInvoiceTemplateCreateCriteria {
  NONE = "NONE",
  PROFIT_MORE_THAN_ZERO = "PROFIT_MORE_THAN_ZERO",
}

export interface PluginEInvoiceTemplate {
  fields: PluginEInvoiceTemplateField[];
  autoCreateMode?: PluginEInvoiceTemplateAutoCreateMode;
  createCriteria?: PluginEInvoiceTemplateCreateCriteria;
}

export type PluginEInvoiceTemplates = Partial<
  Record<PluginEInvoiceTemplateType, PluginEInvoiceTemplate>
>;

export interface PluginEInvoiceTemplateVariable {
  description?: string;
  isNumerical?: true;
  childVariables?: Record<string, PluginEInvoiceTemplateVariable>;
  templateTypes?: PluginEInvoiceTemplateType[];
  workspaceTypes?: WorkspaceType[];
  isSelectable?: boolean;
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
