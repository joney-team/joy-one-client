import { Gender } from '../app.types';
import { CustomerKycsService } from '../customer-kycs/customer-kycs.service';
import { LoansService } from '../loans/loans.service';
import { LoanAssetType, LoanPackageType } from '../loans/loans.types';
import { ReceiptsService } from '../receipts/receipts.service';
import { ReceiptPaymentMethod, ReceiptType } from '../receipts/receipts.types';
import { UseWorkspaceContext, useWorkspaceContext } from '../test/test.helpers';
import { processAsync } from '../utils/process.utils';
import { PluginEInvoiceTemplateVariableName } from './plugin-e-invoice-variables';
import { PluginEInvoicesService } from './plugin-e-invoices.service';
import {
  PluginEInvoicesProviderType,
  PluginEInvoiceTemplate,
  PluginEInvoiceTemplateType,
} from './plugin-e-invoices.types';

async function setup(
  ctx: UseWorkspaceContext,
  template: PluginEInvoiceTemplate,
) {
  const loans = ctx.app.get(LoansService);
  const eInvoices = ctx.app.get(PluginEInvoicesService);
  const customerKycs = ctx.app.get(CustomerKycsService);
  const receipts = ctx.app.get(ReceiptsService);

  const [customer] = await processAsync([
    ctx.services.customers.create({
      member: ctx.admin.member,
      input: {
        name: 'Nguyen Van A',
        phone: '0909090909',
        email: 'nguyen@gmail.com',
        medicalHistory: [],
        location: {
          address: '123 Nguyen Van Linh, Q9, TP.HCM',
        },
      },
    }),
    ctx.services.workspaceSettings.patchUpdate({
      member: ctx.admin.member,
      input: {
        loanSettings: {
          loanPackages: [
            {
              assetTypes: [LoanAssetType.ICLOUD],
              periodDaysOptions: [10, 15, 30],
              lateInterestRates: [],
              unFixedCapitalRates: [],
              id: 'ICLOUDT1',
              description: 'iCloud 1 tháng',
              type: LoanPackageType.INSTALLMENT,
              contractFee: 2500,
              days: 30,
              liquidationFeeRate: 0,
            },
          ],
        },
      },
    }),
    eInvoices.createProvider({
      member: ctx.admin.member,
      input: {
        type: PluginEInvoicesProviderType.MATBAO,
        auth: {
          MST: '0302712571-999',
          TDNhap: 'admin',
          MKhau: 'Gtybf@12sd',
        },
        templates: {
          [PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT]: template,
          [PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT]: template,
        },
      },
    }),
  ]);

  await customerKycs.register({
    member: ctx.admin.member,
    customerId: customer._id.toString(),
    input: {
      cidNumber: '1234567890',
      cidFullName: 'Nguyen Van A',
      cidBirthday: 1234567890,
      cidGender: Gender.MALE,
      cidLocation: {},
      backOfCidImage: '',
      frontOfCidImage: '',
      portraitImage: '',
    },
  });

  await customerKycs.approve({
    member: ctx.admin.member,
    customerId: customer._id.toString(),
  });

  const loan = await loans.create({
    member: ctx.admin.member,
    input: {
      amount: 1000000,
      assetData: {},
      assetType: LoanAssetType.ICLOUD,
      customerId: customer._id.toString(),
      packageId: 'ICLOUDT1',
      packagePeriodDays: 10,
    },
  });

  await loans.sign({
    id: loan.id,
    member: ctx.admin.member,
    input: {
      signature: '1234567890',
    },
  });

  await loans.approve({
    member: ctx.admin.member,
    id: loan.id,
  });

  await loans.fulfill({
    member: ctx.admin.member,
    id: loan.id,
    input: {
      paymentMethod: ReceiptPaymentMethod.BANK_TRANSFER,
      receiptFileIds: [],
    },
  });

  const paymentReceipts = await receipts.list({
    member: ctx.admin.member,
    query: { relatedLoanId: loan.id, type: ReceiptType.INCOME },
  });

  const receiptPaid = await receipts.pay({
    member: ctx.admin.member,
    id: paymentReceipts.data[0].id,
    input: { paymentMethod: ReceiptPaymentMethod.BANK_TRANSFER },
  });

  return { eInvoices, customer, loanId: loan.id, receiptId: receiptPaid.id };
}

describe.skip('Plugins > E-Invoices', () => {
  it(
    'Generate Invoice',
    useWorkspaceContext(async (ctx) => {
      const { receiptId, eInvoices } = await setup(ctx, {
        fields: [
          {
            id: '1',
            value: '1234567890',
            type: 'variable',
            fieldName: 'CUSTOMER_CODE',
            variable: PluginEInvoiceTemplateVariableName.CUSTOMER_CODE,
          },
          {
            id: '2',
            value: 'Nguyen Van A',
            type: 'variable',
            fieldName: 'CUSTOMER_NAME',
            variable: PluginEInvoiceTemplateVariableName.CUSTOMER_NAME,
          },
          {
            id: '3',
            value: '0909090909',
            type: 'variable',
            fieldName: 'CUSTOMER_PHONE',
            variable: PluginEInvoiceTemplateVariableName.CUSTOMER_PHONE,
          },
          {
            id: '4',
            value: 'nguyen@gmail.com',
            type: 'variable',
            fieldName: 'CUSTOMER_EMAIL',
            variable: PluginEInvoiceTemplateVariableName.CUSTOMER_EMAIL,
          },
          {
            id: '5',
            value: '1234567890',
            type: 'variable',
            fieldName: 'CUSTOMER_NATIONAL_ID_NUMBER',
            variable:
              PluginEInvoiceTemplateVariableName.CUSTOMER_NATIONAL_ID_NUMBER,
          },
          {
            id: '6',
            value: '123 Nguyen Van Linh, Q9, TP.HCM',
            type: 'variable',
            fieldName: 'CUSTOMER_ADDRESS',
            variable: PluginEInvoiceTemplateVariableName.CUSTOMER_ADDRESS,
          },
          {
            id: '7',
            value: '2021-01-01',
            type: 'variable',
            fieldName: 'RECEIPT_PAID_AT',
            variable: PluginEInvoiceTemplateVariableName.RECEIPT_PAID_AT,
          },
          {
            id: '8',
            value: '1000000',
            type: 'variable',
            fieldName: 'RECEIPT_AMOUNT',
            variable: PluginEInvoiceTemplateVariableName.RECEIPT_AMOUNT,
          },
          {
            id: '9',
            value: '1234567890',
            type: 'variable',
            fieldName: 'RECEIPT_CODE',
            variable: PluginEInvoiceTemplateVariableName.RECEIPT_CODE,
          },
          {
            id: '10',
            value: '1234567890',
            type: 'variable',
            fieldName: 'LOAN_CODE',
            variable: PluginEInvoiceTemplateVariableName.LOAN_CODE,
          },
          {
            id: '11',
            value: '1234567890',
            type: 'variable',
            fieldName: 'ORDER_ITEMS',
            variable: PluginEInvoiceTemplateVariableName.ORDER_ITEMS,
            children: [
              {
                id: '1',
                value: '1',
                type: 'variable',
                fieldName: 'ORDER_ITEM_INDEX',
                variable: PluginEInvoiceTemplateVariableName.ORDER_ITEM_INDEX,
              },
            ],
          },
          {
            id: '12',
            value: '= @RECEIPT_AMOUNT + 100000',
            type: 'variable',
            fieldName: 'FORMULA',
          },
        ],
      });

      const { invoiceData } = await eInvoices.generateInvoiceData({
        member: ctx.admin.member,
        input: { receiptId },
      });

      console.info('invoice', invoiceData);
    }),
  );
});
