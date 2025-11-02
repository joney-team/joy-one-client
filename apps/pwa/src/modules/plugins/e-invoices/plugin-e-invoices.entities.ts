import { BaseMongoEntity } from "@/types";
import {
  PluginEInvoicesProviderType,
  PluginEInvoicesProviderInformation,
  PluginEInvoiceTemplates,
} from "./plugin-e-invoices.types";

export enum PluginEInvoicesProviderStatus {
  ACTIVE = "ACTIVE",
  AUTH_FAILED = "AUTH_FAILED",
  INACTIVE = "INACTIVE",
}

export interface PluginEInvoicesProviderEntity extends BaseMongoEntity {
  name: string;
  logo: string;
  type: PluginEInvoicesProviderType;
  auth: string;
  templates: PluginEInvoiceTemplates;
  status: PluginEInvoicesProviderStatus;
  apiUrl?: string;
}

export interface PluginEInvoicesEntity extends BaseMongoEntity {
  providerId: string;
  receiptId: string;
  receiptCode: string;
  invoiceId: string;
  invoiceData: Record<string, unknown>;
  providerData: Record<string, unknown>;
  url?: string;
  provider: Pick<PluginEInvoicesProviderEntity, "_id" | "type"> &
    Pick<PluginEInvoicesProviderInformation, "name" | "logo">;
  isCancelled?: boolean;
}
