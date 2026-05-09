import { WorkspaceType } from "../workspaces/workspaces.types";
import { PluginZaloOaZNSTemplateId } from "./plugin-zalo-oas.types";

export interface ZnsTemplateConfig {
  workspaceTypes?: WorkspaceType[],
  fields: { fieldName: string, description?: string, default?: string }[],
}

export type ZnsTemplateConfigs = {
  [key in PluginZaloOaZNSTemplateId]: ZnsTemplateConfig;
}

export const znsTemplateConfigs: ZnsTemplateConfigs = {
  BOOKING: {
    fields: [
      { fieldName: 'schedule_time', description: 'booking_time', default: '09:30 28/06/2024' },
      { fieldName: 'customer_name', description: 'customer_name', default: 'Nguyen Van Hoang' },
      { fieldName: 'address', description: 'workspace_address', default: '' },
      { fieldName: 'booking_code', description: 'customer_code', default: 'C001' },
    ]
  },
  CUSTOMER_BIRTHDAY: {
    fields: [
      { fieldName: 'customer_name', description: 'customer_name', default: "Nguyen Van Hoang" },
      { fieldName: 'company_name', description: 'workspace_name', default: "" },
    ]
  },
  OTP: {
    fields: [
      { fieldName: 'otp', description: 'verify_code', default: "123456" },
    ]
  },
  LOAN_FULFILLED: {
    workspaceTypes: [WorkspaceType.CREDIT],
    fields: [
      { fieldName: 'customer_name', description: 'customer_name', default: "Nguyen Van Hoang" },
      { fieldName: 'loan_code', description: 'Code', default: "241101" },
      { fieldName: 'loan_amount', description: 'money_amount', default: "1000000" },
      { fieldName: 'date', description: 'created_at', default: "11:30 24/11/2024" },
    ]
  },
  LOAN_RECEIPT_PAID: {
    workspaceTypes: [WorkspaceType.CREDIT],
    fields: [
      { fieldName: 'customer_name', description: 'customer_name', default: "Nguyen Van Hoang" },
      { fieldName: 'loan_code', description: 'Code', default: "241101" },
      { fieldName: 'receipt_code', description: 'receipt_code', default: "R001" },
      { fieldName: 'receipt_amount', description: 'receipt_amount', default: "1000000" },
    ]
  },
  LOAN_RECEIPT_PARTIAL_PAY: {
    workspaceTypes: [WorkspaceType.CREDIT],
    fields: [
      { fieldName: 'customer_name', description: 'customer_name', default: "Nguyen Van Hoang" },
      { fieldName: 'loan_code', description: 'Code', default: "241101" },
      { fieldName: 'receipt_code', description: 'receipt_code', default: "R001" },
      { fieldName: 'receipt_amount', description: 'receipt_amount', default: "1000000" },
      { fieldName: 'next_pay_date', description: 'next_pay_date', default: "11:30 24/11/2024" },
    ]
  },
  LOAN_RECEIPT_REMIND: {
    workspaceTypes: [WorkspaceType.CREDIT],
    fields: [
      { fieldName: 'customer_name', description: 'customer_name', default: "Nguyen Van Hoang" },
      { fieldName: 'loan_code', description: 'Code', default: "241101" },
      { fieldName: 'receipt_code', description: 'receipt_code', default: "R001" },
      { fieldName: 'receipt_amount', description: 'receipt_amount', default: "1000000" },
      { fieldName: 'pay_date', description: 'pay_date', default: "11:30 24/11/2024" },
    ]
  }
}