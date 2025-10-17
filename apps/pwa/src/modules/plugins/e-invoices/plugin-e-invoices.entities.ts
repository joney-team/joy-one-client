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

export interface PluginEInvoicesEntity extends BaseMongoEntity {
  providerId: string;
  receiptId: string;
  receiptCode: string;
  invoiceId: string;
  invoiceData: Record<string, unknown>;
  providerData: Record<string, unknown>;
  url?: string;
  provider: Pick<PluginEInvoicesProviderEntity, "_id" | "provider">;
}
