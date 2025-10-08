import {
  PluginEInvoicesProvider,
  PluginEInvoicesProviderStatus,
  PluginEInvoiceTemplateType,
} from "./plugin-e-invoices.types";

export const eInvoicesProviders: Record<
  PluginEInvoicesProvider,
  {
    name: string;
    logo: string;
  }
> = {
  [PluginEInvoicesProvider.MATBAO]: {
    name: "Mắt Bão",
    logo: "https://www.matbao.net/images/menu-v2/Logo_MB_v2_c.svg",
  },
};

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
  [PluginEInvoiceTemplateType.LOAN_RECEIPT]: "loans",
  [PluginEInvoiceTemplateType.ORDER_RECEIPT]: "orders",
};
