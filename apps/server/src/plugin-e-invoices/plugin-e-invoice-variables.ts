import { getLoanReceiptReport } from '../loans/loans.utils';
import { renderVnLocation } from '../locations/locations.utils';
import { ReceiptType } from '../receipts/receipts.types';
import { Currency } from '../utils/currency.utils';
import { DateTime } from '../utils/date-time';
import { WorkspaceType } from '../workspaces/workspaces.types';
import {
  GenerateEInvoiceDataContext,
  PluginEInvoiceTemplateType,
} from './plugin-e-invoices.types';

export enum PluginEInvoiceTemplateVariableName {
  CUSTOMER_CODE = 'customerCode',
  CUSTOMER_NAME = 'customerName',
  CUSTOMER_PHONE = 'customerPhone',
  CUSTOMER_EMAIL = 'customerEmail',
  CUSTOMER_NATIONAL_ID_NUMBER = 'customerNationalIdNumber',
  CUSTOMER_ADDRESS = 'customerAddress',
  RECEIPT_PAID_AT = 'receiptPaidAt',
  RECEIPT_AMOUNT = 'receiptAmount',
  RECEIPT_CODE = 'receiptCode',
  LOAN_CODE = 'loanCode',
  LOAN_PROFIT = 'loanProfit',
  LOAN_SIGNED_AT = 'loanSignedAt',
  LOAN_SIGNED_AT_DATE = 'loanSignedAtDate',
  LOAN_PERIOD_START_AT = 'loanPeriodStartAt',
  LOAN_PERIOD_END_AT = 'loanPeriodEndAt',
  ORDER_ITEMS = 'orderItems',
  ORDER_ITEM_INDEX = 'orderItemIndex',
  ORDER_ITEM_PRODUCT = 'orderItemProduct',
  ORDER_ITEM_QUANTITY = 'orderItemQuantity',
  ORDER_ITEM_PRICE = 'orderItemPrice',
  SINGLE_ITEM = 'singleItem',
}

export interface PluginEInvoiceTemplateVariable {
  name?: string;
  description?: string;
  isNumerical?: boolean;
  childVariables?: Partial<
    Record<PluginEInvoiceTemplateVariableName, PluginEInvoiceTemplateVariable>
  >;
  templateTypes?: PluginEInvoiceTemplateType[];
  workspaceTypes?: WorkspaceType[];
  retrieve?: (context: GenerateEInvoiceDataContext) => Promise<unknown>;
  isSelectable?: boolean;
}

export const pluginEInvoiceTemplateVariables: Partial<
  Record<PluginEInvoiceTemplateVariableName, PluginEInvoiceTemplateVariable>
> = {
  [PluginEInvoiceTemplateVariableName.LOAN_CODE]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    retrieve: async (context) => context.loan?.code,
  },
  [PluginEInvoiceTemplateVariableName.LOAN_PROFIT]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    isNumerical: true,
    retrieve: async (context) => {
      const { receipt, serviceReceipts, loan } = context;
      if (!loan || !receipt.data) return 0;

      const loanReceiptReport = getLoanReceiptReport(receipt);
      if (
        !loanReceiptReport ||
        !loanReceiptReport.period ||
        loanReceiptReport.fee <= 0
      )
        return 0;

      const loanReceipts = await serviceReceipts.list({
        workspaceId: receipt.workspaceId,
        query: {
          relatedLoanId: loan.id,
          type: ReceiptType.INCOME,
          getAll: true,
        },
      });

      // Combine fee of current period and next period if next period fee is negative
      const nextPeriodReceipt = loanReceipts.results.find(
        (v) => v.data?.period?.period === loanReceiptReport.period + 1,
      );

      if (nextPeriodReceipt) {
        const nextPeriodReceiptReport = getLoanReceiptReport(nextPeriodReceipt);

        if (nextPeriodReceiptReport && nextPeriodReceiptReport.fee < 0) {
          return Currency.normalize(
            loanReceiptReport.fee + nextPeriodReceiptReport.fee,
            context.workspaceSetting.currencyCode,
          );
        }
      }

      return Currency.normalize(
        loanReceiptReport.fee,
        context.workspaceSetting.currencyCode,
      );
    },
  },
  [PluginEInvoiceTemplateVariableName.LOAN_SIGNED_AT]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    retrieve: async (context) => {
      const { loan } = context;
      if (!loan || !loan.createdAt) return null;
      return DateTime.format(loan.createdAt, {
        locale: context.workspace.locale,
      });
    },
  },
  [PluginEInvoiceTemplateVariableName.LOAN_SIGNED_AT_DATE]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    retrieve: async (context) => {
      const { loan } = context;
      return DateTime.format(loan.createdAt, {
        locale: context.workspace.locale,
        dateStyle: 'full',
      });
    },
  },
  [PluginEInvoiceTemplateVariableName.LOAN_PERIOD_START_AT]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    retrieve: async (context) => {
      const { receipt } = context;
      if (
        receipt.data &&
        receipt.data.period &&
        receipt.data.period.startTime &&
        receipt.data.period.endTime
      ) {
        return DateTime.format(receipt.data.period.startTime, {
          locale: context.workspace.locale,
        });
      }
    },
  },
  [PluginEInvoiceTemplateVariableName.LOAN_PERIOD_END_AT]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    retrieve: async (context) => {
      const { receipt } = context;
      if (
        receipt.data &&
        receipt.data.period &&
        receipt.data.period.startTime &&
        receipt.data.period.endTime
      ) {
        return DateTime.format(receipt.data.period.endTime, {
          locale: context.workspace.locale,
        });
      }
    },
  },
  [PluginEInvoiceTemplateVariableName.CUSTOMER_CODE]: {
    retrieve: async (context) => context.customer?.code,
  },
  [PluginEInvoiceTemplateVariableName.CUSTOMER_NAME]: {
    retrieve: async (context) => context.customer?.name,
  },
  [PluginEInvoiceTemplateVariableName.CUSTOMER_PHONE]: {
    retrieve: async (context) => context.customer?.phone,
  },
  [PluginEInvoiceTemplateVariableName.CUSTOMER_EMAIL]: {
    retrieve: async (context) => context.customer?.email,
  },
  [PluginEInvoiceTemplateVariableName.CUSTOMER_NATIONAL_ID_NUMBER]: {
    retrieve: async (context) =>
      context.customerKyc?.versions[context.customerKyc.versions.length - 1]
        .cidNumber,
  },
  [PluginEInvoiceTemplateVariableName.CUSTOMER_ADDRESS]: {
    retrieve: async (context) => renderVnLocation(context.customer?.location),
  },
  [PluginEInvoiceTemplateVariableName.RECEIPT_PAID_AT]: {
    retrieve: async (context) => new Date(context.receipt.paidAt * 1000),
  },
  [PluginEInvoiceTemplateVariableName.RECEIPT_AMOUNT]: {
    isNumerical: true,
    retrieve: async (context) => {
      return Currency.normalize(
        context.receipt.amount,
        context.workspaceSetting.currencyCode,
      );
    },
  },
  [PluginEInvoiceTemplateVariableName.RECEIPT_CODE]: {
    retrieve: async (context) => context.receipt.code,
  },
  [PluginEInvoiceTemplateVariableName.SINGLE_ITEM]: {
    isSelectable: true,
    childVariables: {},
  },
  [PluginEInvoiceTemplateVariableName.ORDER_ITEMS]: {
    templateTypes: [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT],
    isSelectable: true,
    childVariables: {
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_INDEX]: {
        isNumerical: true,
        templateTypes: [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT],
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_PRODUCT]: {
        isNumerical: true,
        templateTypes: [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT],
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_QUANTITY]: {
        isNumerical: true,
        templateTypes: [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT],
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_PRICE]: {
        isNumerical: true,
        templateTypes: [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT],
      },
    },
  },
};
