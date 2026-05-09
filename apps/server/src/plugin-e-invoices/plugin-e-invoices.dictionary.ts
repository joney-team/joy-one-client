import { AppLocale, Dictionary } from '../lang/lang.types';
import { PluginEInvoiceTemplateVariableName } from './plugin-e-invoice-variables';
import { PluginEInvoiceTemplateType } from './plugin-e-invoices.types';

export const pluginEInvoiceTemplateVariableDescriptionsDictionary: Dictionary<PluginEInvoiceTemplateVariableName> =
  {
    prefix: 'e_invoice_variable',
    dictionary: {
      [PluginEInvoiceTemplateVariableName.CUSTOMER_NAME]: {
        [AppLocale.vi]: 'Tên khách hàng',
        [AppLocale.en]: 'Customer name',
      },
      [PluginEInvoiceTemplateVariableName.CUSTOMER_PHONE]: {
        [AppLocale.vi]: 'Số điện thoại khách hàng',
        [AppLocale.en]: 'Customer phone',
      },
      [PluginEInvoiceTemplateVariableName.CUSTOMER_ADDRESS]: {
        [AppLocale.vi]: 'Địa chỉ khách hàng',
        [AppLocale.en]: 'Customer address',
      },
      [PluginEInvoiceTemplateVariableName.RECEIPT_PAID_AT]: {
        [AppLocale.vi]: 'Ngày thanh toán',
        [AppLocale.en]: 'Receipt paid at',
      },
      [PluginEInvoiceTemplateVariableName.RECEIPT_AMOUNT]: {
        [AppLocale.vi]: 'Tổng tiền',
        [AppLocale.en]: 'Receipt amount',
      },
      [PluginEInvoiceTemplateVariableName.RECEIPT_CODE]: {
        [AppLocale.vi]: 'Mã hóa đơn',
        [AppLocale.en]: 'Receipt code',
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEMS]: {
        [AppLocale.vi]: 'Danh sách sản phẩm / dịch vụ',
        [AppLocale.en]: 'Receipt items',
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_INDEX]: {
        [AppLocale.vi]: 'Số thứ tự',
        [AppLocale.en]: 'Order item index',
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_PRODUCT]: {
        [AppLocale.vi]: 'Sản phẩm / dịch vụ',
        [AppLocale.en]: 'Product / Service',
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_QUANTITY]: {
        [AppLocale.vi]: 'Số lượng',
        [AppLocale.en]: 'Quantity',
      },
      [PluginEInvoiceTemplateVariableName.ORDER_ITEM_PRICE]: {
        [AppLocale.vi]: 'Giá',
        [AppLocale.en]: 'Price',
      },
      [PluginEInvoiceTemplateVariableName.CUSTOMER_CODE]: {
        [AppLocale.vi]: 'Mã khách hàng',
        [AppLocale.en]: 'Customer code',
      },
      [PluginEInvoiceTemplateVariableName.CUSTOMER_EMAIL]: {
        [AppLocale.vi]: 'Email khách hàng',
        [AppLocale.en]: 'Customer email',
      },
      [PluginEInvoiceTemplateVariableName.CUSTOMER_NATIONAL_ID_NUMBER]: {
        [AppLocale.vi]: 'Số CMND / CCCD khách hàng',
        [AppLocale.en]: 'Customer national id number',
      },
      [PluginEInvoiceTemplateVariableName.LOAN_CODE]: {
        [AppLocale.vi]: 'Mã hồ sơ vay',
        [AppLocale.en]: 'Loan code',
      },
      [PluginEInvoiceTemplateVariableName.SINGLE_ITEM]: {
        [AppLocale.vi]: 'Sản phẩm / dịch vụ đơn lẻ',
        [AppLocale.en]: 'Single product / service',
      },
      [PluginEInvoiceTemplateVariableName.LOAN_PROFIT]: {
        [AppLocale.vi]: 'Lợi nhuận gói vay',
        [AppLocale.en]: 'Loan package profit',
      },
      [PluginEInvoiceTemplateVariableName.LOAN_SIGNED_AT]: {
        [AppLocale.vi]: 'Ngày ký hồ sơ vay',
        [AppLocale.en]: 'Loan contract signed at',
      },
      [PluginEInvoiceTemplateVariableName.LOAN_SIGNED_AT_DATE]: {
        [AppLocale.vi]: 'Ngày ký hồ sơ vay (định dạng ngày)',
        [AppLocale.en]: 'Loan contract signed at (date format)',
      },
      [PluginEInvoiceTemplateVariableName.LOAN_PERIOD_START_AT]: {
        [AppLocale.vi]: 'Ngày bắt đầu kỳ thanh toán',
        [AppLocale.en]: 'Loan period start at',
      },
      [PluginEInvoiceTemplateVariableName.LOAN_PERIOD_END_AT]: {
        [AppLocale.vi]: 'Ngày kết thúc kỳ thanh toán',
        [AppLocale.en]: 'Loan period end at',
      },
    },
  };

export const pluginEInvoiceTemplateTypesDictionary: Dictionary<PluginEInvoiceTemplateType> =
  {
    prefix: 'e_invoice_template_type',
    dictionary: {
      [PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT]: {
        [AppLocale.vi]: 'Hồ sơ vay - Hóa đơn thanh toán',
        [AppLocale.en]: 'Loan - Payment receipt',
      },
      [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT]: {
        [AppLocale.vi]: 'Đơn hàng - Hóa đơn thanh toán',
        [AppLocale.en]: 'Order - Payment receipt',
      },
    },
  };
