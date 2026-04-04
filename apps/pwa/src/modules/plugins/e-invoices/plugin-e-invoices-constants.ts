import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import {
  PluginEInvoiceTemplateAutoCreateMode,
  PluginEInvoiceTemplateCreateCriteria,
  PluginEInvoiceTemplateType,
} from "./plugin-e-invoices.types";
import { PluginEInvoicesProviderStatus } from "@/graphql/enums.graphql";

export const eInvoicesProviderStatuses: Record<
  PluginEInvoicesProviderStatus,
  {
    name: MacroMessageDescriptor;
    color: string;
  }
> = {
  [PluginEInvoicesProviderStatus.Active]: {
    name: defineMessage`Active`,
    color: "green",
  },
  [PluginEInvoicesProviderStatus.AuthFailed]: {
    name: defineMessage`Auth failed`,
    color: "red",
  },
  [PluginEInvoicesProviderStatus.Inactive]: {
    name: defineMessage`Inactive`,
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
    name: MacroMessageDescriptor;
  }
> = {
  [PluginEInvoiceTemplateAutoCreateMode.NONE]: { name: defineMessage`None` },
  [PluginEInvoiceTemplateAutoCreateMode.EXPIRE_TIME]: {
    name: defineMessage`For expired time of receipt`,
  },
};

export const eInvoicesTemplateCreateCriteria: Record<
  PluginEInvoiceTemplateCreateCriteria,
  { name: MacroMessageDescriptor }
> = {
  [PluginEInvoiceTemplateCreateCriteria.NONE]: { name: defineMessage`None` },
  [PluginEInvoiceTemplateCreateCriteria.PROFIT_MORE_THAN_ZERO]: {
    name: defineMessage`Loan profit more than 0`,
  },
};
