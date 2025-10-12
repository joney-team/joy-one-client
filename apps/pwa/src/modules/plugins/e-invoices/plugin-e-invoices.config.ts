import {
  PluginEInvoicesProviderStatus,
  PluginEInvoiceTemplateType,
} from "./plugin-e-invoices.types";

export const eInvoicesProviderStatuses: Record<
  PluginEInvoicesProviderStatus,
  {
    name: string;
    color: string;
  }
> = {
  [PluginEInvoicesProviderStatus.ACTIVE]: {
    name: "active",
    color: "green",
  },
  [PluginEInvoicesProviderStatus.AUTH_FAILED]: {
    name: "auth_failed",
    color: "red",
  },
  [PluginEInvoicesProviderStatus.INACTIVE]: {
    name: "inactive",
    color: "gray",
  },
};

export const eInvoicesTemplateTypes: Record<PluginEInvoiceTemplateType, string> = {
  [PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT]: "loans",
  [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT]: "orders",
};
