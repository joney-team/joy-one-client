import { t } from "@lingui/core/macro";
import {
  PluginEInvoicesProviderStatus,
  PluginEInvoiceTemplateType,
} from "./plugin-e-invoices.types";

export const eInvoicesProviderStatuses: Record<
  PluginEInvoicesProviderStatus,
  {
    name: () => string;
    color: string;
  }
> = {
  [PluginEInvoicesProviderStatus.ACTIVE]: {
    name: () => t`Active`,
    color: "green",
  },
  [PluginEInvoicesProviderStatus.AUTH_FAILED]: {
    name: () => t`Auth failed`,
    color: "red",
  },
  [PluginEInvoicesProviderStatus.INACTIVE]: {
    name: () => t`Inactive`,
    color: "gray",
  },
};

export const eInvoicesTemplateTypes: Record<PluginEInvoiceTemplateType, string> = {
  [PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT]: "loans",
  [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT]: "orders",
};
