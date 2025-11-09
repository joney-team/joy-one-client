import { t } from "@lingui/core/macro";
import {
  PluginEInvoicesProviderStatus,
  PluginEInvoiceTemplateAutoCreateMode,
  PluginEInvoiceTemplateCreateCriteria,
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

export const eInvoicesTemplateAutoCreateModes: Record<
  PluginEInvoiceTemplateAutoCreateMode,
  {
    name: () => string;
  }
> = {
  [PluginEInvoiceTemplateAutoCreateMode.NONE]: { name: () => t`None` },
  [PluginEInvoiceTemplateAutoCreateMode.EXPIRE_TIME]: {
    name: () => t`For expired time of receipt`,
  },
};

export const eInvoicesTemplateCreateCriteria: Record<
  PluginEInvoiceTemplateCreateCriteria,
  { name: () => string }
> = {
  [PluginEInvoiceTemplateCreateCriteria.NONE]: { name: () => t`None` },
  [PluginEInvoiceTemplateCreateCriteria.PROFIT_MORE_THAN_ZERO]: {
    name: () => t`Loan profit more than 0`,
  },
};
