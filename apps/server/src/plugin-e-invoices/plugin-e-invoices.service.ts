import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { CustomerKycsService } from '../customer-kycs/customer-kycs.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseName } from '../database/database.types';
import {
  bindData,
  mustBeObjectId,
  RawObjectId,
  safeBindData,
  safeGet,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { LoansService } from '../loans/loans.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { cryptoEncrypt } from '../utils/crypto.util';
import { processAsync } from '../utils/process.utils';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PluginEInvoicesEntity } from './entities/plugin-e-invoice.entity';
import { PluginEInvoiceProviderEntity } from './entities/plugin-e-invoice-provider.entity';
import {
  PluginEInvoiceProviderInformation,
  pluginEInvoicesProviderInformations,
  PluginEInvoicesProvidersInstance,
} from './plugin-e-invoice-providers.instance';
import { PluginEInvoiceTemplateVariableName } from './plugin-e-invoice-variables';
import {
  CreatePluginEInvoiceProviderInput,
  GenerateEInvoiceDataInput,
  PluginEInvoiceProviderStatus,
  PluginEInvoiceTemplateCreateCriteria,
  UpdatePluginEInvoiceProviderInput,
} from './plugin-e-invoices.types';

@Injectable()
export class PluginEInvoicesService {
  constructor(
    @InjectRepository(PluginEInvoiceProviderEntity, DatabaseName.MONGO)
    private readonly providersRepository: MongoRepository<PluginEInvoiceProviderEntity>,
    @InjectRepository(PluginEInvoicesEntity, DatabaseName.MONGO)
    private readonly invoicesRepository: MongoRepository<PluginEInvoicesEntity>,
    private readonly receipts: ReceiptsService,
    private readonly loans: LoansService,
    private readonly customers: CustomersService,
    private readonly customerKycs: CustomerKycsService,
    private readonly queueProducers: QueueProducersService,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceSettings: WorkspaceSettingsService,
  ) {}

  bindProviderData(provider: PluginEInvoiceProviderEntity) {
    const { logo, name } = pluginEInvoicesProviderInformations[provider.type];
    let data = { ...provider, logo, name };
    delete data.auth;
    return data;
  }

  async getProviders(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    return this.providersRepository.find({
      where: { workspaceId, isArchived: { $ne: true } },
    });
  }

  async createProvider(
    args: WithWorkspaceArgs<{ input: CreatePluginEInvoiceProviderInput }>,
  ) {
    const { input } = args;
    const { workspaceId, member } = withWorkspaceArgs(args);

    const provider = new PluginEInvoiceProviderEntity();
    provider._id = new ObjectId();
    provider.workspaceId = workspaceId;
    provider.type = input.type;

    provider.createdByUserId = member?.userId;
    provider.status = PluginEInvoiceProviderStatus.ACTIVE;
    provider.templates = input.templates;
    provider.apiUrl = input.apiUrl;

    if (input.auth) {
      provider.auth = cryptoEncrypt(input.auth, configs.ENCRYPT_PASSWORD);
    }

    await this.providersRepository.save(provider);
    return this.healthcheckProvider({ id: provider._id, workspaceId });
  }

  async getProvider(args: WithWorkspaceArgs<{ providerId: string }>) {
    const { workspaceId, member } = withWorkspaceArgs(args);

    const provider = await this.providersRepository.findOne({
      where: { _id: mustBeObjectId(args.providerId), workspaceId },
    });

    if (!provider) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: provider });
    return provider;
  }

  async updateProvider(
    args: WithWorkspaceArgs<{
      input: UpdatePluginEInvoiceProviderInput;
      providerId: string;
    }>,
  ) {
    const { input } = withWorkspaceArgs(args);

    const provider = await this.getProvider(args);

    if (input.type) {
      provider.type = input.type;
    }

    if (input.templates) {
      provider.templates = input.templates;
    }

    if (input.auth) {
      provider.auth = cryptoEncrypt(input.auth, configs.ENCRYPT_PASSWORD);
    }

    if (input.apiUrl) {
      provider.apiUrl = input.apiUrl;
    }

    await this.providersRepository.save(provider);
    return this.healthcheckProvider({
      id: provider._id,
      workspaceId: provider.workspaceId,
    });
  }

  async resetProviderTemplates(
    args: WithWorkspaceArgs<{ providerId: string }>,
  ) {
    const provider = await this.getProvider(args);
    provider.templates =
      pluginEInvoicesProviderInformations[provider.type].defaultTemplates;
    await this.providersRepository.save(provider);
    return provider;
  }

  async archiveProvider(args: WithWorkspaceArgs<{ providerId: string }>) {
    const provider = await this.getProvider(args);
    provider.isArchived = true;
    await this.providersRepository.save(provider);
    return provider;
  }

  async healthcheckProvider(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const { id, member } = withWorkspaceArgs(args);
    const provider = await this.providersRepository.findOne({
      where: { _id: mustBeObjectId(id) },
    });

    if (!provider) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: provider });

    const instance = new PluginEInvoicesProvidersInstance(provider);

    try {
      await instance.init();
      provider.status = PluginEInvoiceProviderStatus.ACTIVE;
      return this.providersRepository.save(provider);
    } catch (error) {
      provider.status = PluginEInvoiceProviderStatus.AUTH_FAILED;
      return this.providersRepository.save(provider);
    }
  }

  async generateInvoiceData(
    args: WithWorkspaceArgs<{
      input: GenerateEInvoiceDataInput;
    }>,
  ) {
    const { workspaceId } = withWorkspaceArgs(args);
    const provider = await this.providersRepository.findOne({
      where: { workspaceId, isArchived: { $ne: true } },
    });

    if (!provider) {
      throw new NotFoundException(
        AppMessage.NOT_HAVE_ANY_AVAILABLE_E_INVOICES_PROVIDER,
      );
    }

    const instance = new PluginEInvoicesProvidersInstance(provider);

    const { receiptId } = args.input;

    const [workspace, workspaceSetting, receipt] = await processAsync([
      this.workspaces.get(workspaceId),
      this.workspaceSettings.get(workspaceId),
      this.receipts.get({ ...args, id: receiptId }),
    ]);

    const [customer, loan] = await processAsync([
      safeGet(receipt.relatedCustomerId, (_id) =>
        this.customers.get({ id: _id, workspaceId }),
      ),
      safeGet(receipt.relatedLoanId, (id) =>
        this.loans.get({ id, workspaceId }),
      ),
    ]);

    const [customerKyc] = await processAsync([
      safeGet(customer?._id.toString(), (id) => this.customerKycs.get(id)),
    ]);

    const { invoiceData, variableValues, templateType } =
      await instance.generateInvoiceData({
        serviceReceipts: this.receipts,
        workspace,
        receipt,
        customer,
        customerKyc,
        loan,
        workspaceSetting,
      });

    return {
      instance,
      invoiceData,
      receipt,
      variableValues,
      templateType,
      template: provider.templates[templateType],
    };
  }

  async createEInvoice(
    args: WithWorkspaceArgs<{
      input: GenerateEInvoiceDataInput;
    }>,
  ) {
    const { workspaceId, member } = withWorkspaceArgs(args);

    const { instance, invoiceData, receipt, variableValues, template } =
      await this.generateInvoiceData(args);

    // Check create criteria
    if (
      template.createCriteria ===
      PluginEInvoiceTemplateCreateCriteria.PROFIT_MORE_THAN_ZERO
    ) {
      if (
        !variableValues[PluginEInvoiceTemplateVariableName.LOAN_PROFIT] ||
        +variableValues[PluginEInvoiceTemplateVariableName.LOAN_PROFIT] <= 0
      ) {
        throw new BadRequestException(
          AppMessage.E_INVOICE_CREATE_CRITERIA_NOT_MET,
        );
      }
    }

    const invoiceResult = await instance.createInvoice({
      invoiceData,
    });

    const invoice = new PluginEInvoicesEntity();
    invoice.workspaceId = workspaceId;
    invoice.providerId = instance.providerId;
    invoice.provider = instance.entity.type;
    invoice.receiptId = receipt.id;
    invoice.receiptCode = receipt.code;
    invoice.invoiceId = invoiceResult.invoiceId;
    invoice.invoiceData = invoiceData;
    invoice.providerData = invoiceResult.providerData;
    invoice.url = invoiceResult.url;
    invoice.createdByUserId = member?.userId;

    await this.invoicesRepository.save(invoice);

    this.queueProducers.captureEvent({
      type: EventType.E_INVOICE_CREATED,
      workspaceId: invoice.workspaceId,
      actionType: EventDataActionType.CREATE,
      ref: invoice._id.toString(),
      userId: member?.userId,
      persist: true,
    });

    return invoice;
  }

  async cancelEInvoice(args: WithWorkspaceArgs<{ invoiceId: string }>) {
    const { workspaceId, member } = withWorkspaceArgs(args);
    const invoice = await this.invoicesRepository.findOne({
      where: { _id: mustBeObjectId(args.invoiceId), workspaceId },
    });
    if (!invoice) throw new NotFoundException();
    validateWorkspaceAccessable({ member, data: invoice });

    const provider = await this.getProvider({
      ...args,
      providerId: invoice.providerId,
    });

    if (!provider) throw new NotFoundException();

    const instance = new PluginEInvoicesProvidersInstance(provider);
    await instance.cancelInvoice(invoice);

    invoice.isCancelled = true;
    await this.invoicesRepository.save(invoice);

    this.queueProducers.captureEvent({
      type: EventType.E_INVOICE_REMOVED,
      workspaceId: invoice.workspaceId,
      actionType: EventDataActionType.ARCHIVED,
      ref: invoice._id.toString(),
      userId: member?.userId,
      persist: true,
    });

    return invoice;
  }

  async bindEInvoiceData(invoice: PluginEInvoicesEntity) {
    return bindData<
      {
        provider: Pick<PluginEInvoiceProviderEntity, '_id' | 'type'> &
          Pick<PluginEInvoiceProviderInformation, 'name' | 'logo'>;
      },
      PluginEInvoicesEntity
    >({
      entity: invoice,
      extends: {
        provider: safeBindData({
          entity: invoice,
          field: 'providerId',
          fetch: async (id) => {
            const entity = await this.providersRepository.findOne({
              where: { _id: mustBeObjectId(id) },
              select: ['_id', 'type'],
            });

            const { logo, name } =
              pluginEInvoicesProviderInformations[entity.type];

            return {
              ...entity,
              logo,
              name,
            };
          },
        }),
      },
    });
  }

  async listEInvoices(args: WithWorkspaceArgs<{ query?: any }>) {
    const findOptions = withMongoQuery<PluginEInvoicesEntity>({
      ...args,
      filterFields: [
        'receiptId',
        'receiptCode',
        'provider',
        'providerId',
        'invoiceId',
      ],
    });

    const data = await this.invoicesRepository.findAndCount(findOptions);

    return {
      total: data[1],
      results: data[0],
    };
  }
}
