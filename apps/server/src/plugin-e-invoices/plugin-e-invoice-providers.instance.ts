import axios, { AxiosInstance } from 'axios';
import { configs } from '../config/config';
import { cryptoDecrypt } from '../utils/crypto.util';
import { PluginEInvoiceProviderEntity } from './entities/plugin-e-invoice-provider.entity';
import {
  PluginEInvoiceTemplateVariable,
  PluginEInvoiceTemplateVariableName,
  pluginEInvoiceTemplateVariables,
} from './plugin-e-invoice-variables';
import {
  GenerateEInvoiceDataContext,
  PluginEInvoicesProviderType,
  PluginEInvoicesProviderAuth,
  PluginEInvoiceTemplateField,
  PluginEInvoiceTemplates,
  PluginEInvoiceTemplateType,
} from './plugin-e-invoices.types';
import { evaluateFormula } from '../utils/evaluate-formula.utils';
import { HttpException } from '@nestjs/common';
import { ReceiptType } from '../receipts/receipts.types';
import { matbaoTemplates } from './plugin-e-invoice-providers.templates';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';

@ObjectType()
export class PluginEInvoiceProviderInformation {
  @Field()
  type: PluginEInvoicesProviderType;

  @Field()
  name: string;

  @Field()
  logo: string;

  @Field({ nullable: true })
  isDemo?: boolean;

  @Field()
  apiUrl: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  defaultTemplates?: PluginEInvoiceTemplates;
}

export const pluginEInvoicesProviderInformations: Record<
  PluginEInvoicesProviderType,
  Omit<PluginEInvoiceProviderInformation, 'type'>
> = {
  [PluginEInvoicesProviderType.MATBAO]: {
    name: 'MATBAO',
    apiUrl: 'https://api-hddt.matbao.in:11443',
    logo: 'https://www.matbao.net/images/menu-v2/Logo_MB_v2_c.svg',
    defaultTemplates: matbaoTemplates,
  },
  [PluginEInvoicesProviderType.MATBAO_DEMO]: {
    name: 'MATBAO (Demo)',
    apiUrl: 'https://demo-api-hddt.matbao.in:11443',
    logo: 'https://www.matbao.net/images/menu-v2/Logo_MB_v2_c.svg',
    isDemo: true,
    defaultTemplates: matbaoTemplates,
  },
};

export class PluginEInvoicesProvidersInstance {
  isInitialized = false;
  providerId: string;
  apiUrl: string;
  entity: PluginEInvoiceProviderEntity;

  private config: Omit<PluginEInvoiceProviderInformation, 'type'>;
  private token: string;
  private api: AxiosInstance;
  private providerAuth: PluginEInvoicesProviderAuth;

  constructor(providerEntity: PluginEInvoiceProviderEntity) {
    this.providerId = providerEntity._id.toString();
    this.entity = providerEntity;
    this.config = pluginEInvoicesProviderInformations[providerEntity.type];
    this.apiUrl = providerEntity.apiUrl || this.config.apiUrl;
  }

  async init() {
    if (this.isInitialized) return;
    if (
      [
        PluginEInvoicesProviderType.MATBAO,
        PluginEInvoicesProviderType.MATBAO_DEMO,
      ].includes(this.entity.type)
    ) {
      this.providerAuth = cryptoDecrypt(
        this.entity.auth,
        configs.ENCRYPT_PASSWORD,
      );

      const response = await axios.post(
        `${this.apiUrl}/api/auth/login`,
        this.providerAuth,
      );

      this.token = response.data.data.accessToken;

      this.api = axios.create({
        baseURL: this.apiUrl,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      this.api.interceptors.response.use(undefined, async (error) => {
        throw new HttpException(error.response?.data, error.response?.status);
      });

      return true;
    }

    throw new Error('Provider not supported');
  }

  getInvoiceTemplateType(context: {
    receipt: {
      type: ReceiptType;
      relatedLoanId?: string;
      relatedOrderId?: string;
    };
  }) {
    const { receipt } = context;

    if (receipt.type === ReceiptType.INCOME) {
      if (receipt.relatedLoanId) {
        return PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT;
      }

      if (receipt.relatedOrderId) {
        return PluginEInvoiceTemplateType.ORDER_INCOME_RECEIPT;
      }
    }

    throw new Error('Receipt type not supported');
  }

  async generateInvoiceData(
    context: Omit<GenerateEInvoiceDataContext, 'templateType'>,
  ): Promise<{
    invoiceData: Record<string, unknown>;
    variableValues: Partial<
      Record<PluginEInvoiceTemplateVariableName, unknown>
    >;
    templateType: PluginEInvoiceTemplateType;
  }> {
    const invoiceTemplateType = this.getInvoiceTemplateType(context);
    const template = this.entity.templates[invoiceTemplateType];

    let variableValues = {};

    // Calculate all variable values
    await Promise.all(
      Object.entries(pluginEInvoiceTemplateVariables).map(
        async ([key, variable]) => {
          if (variable.retrieve) {
            variableValues[key] = await variable.retrieve({
              ...context,
              templateType: invoiceTemplateType,
            });
          }
        },
      ),
    );

    // Format field value
    const formatFieldValue = (field: Partial<PluginEInvoiceTemplateField>) => {
      if (field.value && field.type === 'input') {
        let value = String(field.value ?? '');

        if (typeof field.value === 'string' && field.value.includes('@')) {
          // Replace all variable with syntax @variableName with corresponding variable value from variableValues
          value = field.value.replace(/@(\w+)/g, (match, variableName) => {
            return variableValues.hasOwnProperty(variableName)
              ? (variableValues[variableName] ?? '')
              : '';
          });
        }

        if (typeof field.value === 'string' && field.value.startsWith('=')) {
          return evaluateFormula(value);
        }

        return value;
      }
    };

    // Combine data
    let invoiceData: Record<string, unknown> = {};

    await Promise.all(
      template.fields.map(async (field) => {
        if (!field.fieldName) return;

        if (field.type === 'input' && field.value) {
          invoiceData[field.fieldName] = formatFieldValue(field);
          return;
        }

        const variable: PluginEInvoiceTemplateVariable =
          pluginEInvoiceTemplateVariables[field.variable];

        if (field.type === 'variable' && variable) {
          if (variable.retrieve) {
            invoiceData[field.fieldName] = variableValues[field.variable];
            return;
          }

          if (
            field.variable === PluginEInvoiceTemplateVariableName.SINGLE_ITEM
          ) {
            let item = {};

            await Promise.all(
              (field.children ?? []).map(async (child) => {
                const childVariable = variable.childVariables?.[child.variable];
                if (childVariable && childVariable.retrieve) {
                  item[child.fieldName] = await childVariable.retrieve(context);
                } else {
                  item[child.fieldName] = formatFieldValue(child);
                }
              }),
            );

            invoiceData[field.fieldName] = [item];
            return;
          }
        }
      }),
    );

    return {
      invoiceData,
      variableValues,
      templateType: invoiceTemplateType,
    };
  }

  async createInvoice(args: { invoiceData: Record<string, unknown> }): Promise<{
    invoiceId: string;
    url?: string;
    providerData: Record<string, unknown>;
  }> {
    await this.init();

    const { invoiceData } = args;

    if (
      [
        PluginEInvoicesProviderType.MATBAO,
        PluginEInvoicesProviderType.MATBAO_DEMO,
      ].includes(this.entity.type)
    ) {
      const { data: result } = await this.api.post(
        '/api/invoice/create-invoice',
        [invoiceData],
      );

      if (!result.data[0].success) {
        throw new HttpException(result.data[0].message, 400);
      }

      return {
        invoiceId: result.data[0].data.maSoHDon,
        url:
          result.data[0].data.urlDownloadPDF ||
          result.data[0].data.urlDownloadXML,
        providerData: result.data[0].data,
      };
    }

    throw new Error('Provider not supported');
  }

  async cancelInvoice(args: { invoiceId: string }): Promise<void> {
    await this.init();

    if (
      [
        PluginEInvoicesProviderType.MATBAO,
        PluginEInvoicesProviderType.MATBAO_DEMO,
      ].includes(this.entity.type)
    ) {
      return this.api.post(`/api/invoice/cancel-invoice`, {
        MaSoHDon: args.invoiceId,
      });
    }

    throw new Error('Provider not supported');
  }
}
