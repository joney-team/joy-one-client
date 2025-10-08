import { BaseMongoEntity } from "@/types";
import { PluginEInvoicesProvider, PluginEInvoiceTemplates } from "./plugin-e-invoices.types";

export enum PluginEInvoicesProviderStatus {
  ACTIVE = "ACTIVE",
  AUTH_FAILED = "AUTH_FAILED",
  INACTIVE = "INACTIVE",
}

export interface PluginEInvoicesProviderEntity extends BaseMongoEntity {
  provider: PluginEInvoicesProvider;
  providerAuth: string;
  templates: PluginEInvoiceTemplates;
  status: PluginEInvoicesProviderStatus;
}
