import { PluginZaloOaZnsTemplateId } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";

export const pluginZaloOaZNSTemplateIds: Record<
  PluginZaloOaZnsTemplateId,
  { name: MacroMessageDescriptor }
> = {
  [PluginZaloOaZnsTemplateId.Booking]: {
    name: defineMessage`Booking`,
  },
  [PluginZaloOaZnsTemplateId.CustomerBirthday]: {
    name: defineMessage`Customer birthday`,
  },
  [PluginZaloOaZnsTemplateId.Otp]: {
    name: defineMessage`OTP`,
  },
  [PluginZaloOaZnsTemplateId.LoanFulfilled]: {
    name: defineMessage`Loan fulfilled`,
  },
  [PluginZaloOaZnsTemplateId.LoanReceiptPaid]: {
    name: defineMessage`Loan receipt paid`,
  },
  [PluginZaloOaZnsTemplateId.LoanReceiptPartialPay]: {
    name: defineMessage`Loan receipt partial pay`,
  },
  [PluginZaloOaZnsTemplateId.LoanReceiptRemind]: {
    name: defineMessage`Loan receipt remind`,
  },
};
