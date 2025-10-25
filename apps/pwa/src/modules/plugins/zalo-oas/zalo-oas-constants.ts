import { t } from "@lingui/core/macro";
import { PluginZaloOaZNSTemplateId } from "./zalo-oas-types";

export const pluginZaloOaZNSTemplateIds: Record<PluginZaloOaZNSTemplateId, { name: () => string }> =
  {
    [PluginZaloOaZNSTemplateId.BOOKING]: {
      name: () => t`Booking`,
    },
    [PluginZaloOaZNSTemplateId.CUSTOMER_BIRTHDAY]: {
      name: () => t`Customer birthday`,
    },
    [PluginZaloOaZNSTemplateId.OTP]: {
      name: () => t`OTP`,
    },
    [PluginZaloOaZNSTemplateId.LOAN_FULFILLED]: {
      name: () => t`Loan fulfilled`,
    },
    [PluginZaloOaZNSTemplateId.LOAN_RECEIPT_PAID]: {
      name: () => t`Loan receipt paid`,
    },
    [PluginZaloOaZNSTemplateId.LOAN_RECEIPT_PARTIAL_PAY]: {
      name: () => t`Loan receipt partial pay`,
    },
    [PluginZaloOaZNSTemplateId.LOAN_RECEIPT_REMIND]: {
      name: () => t`Loan receipt remind`,
    },
  };
