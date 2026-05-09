import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { PluginEInvoicesEntity } from './entities/plugin-e-invoice.entity';
import { PluginEInvoicesService } from './plugin-e-invoices.service';
import { GenerateEInvoiceDataInput } from './plugin-e-invoices.types';
import {
  PluginEInvoiceProviderInformation,
  pluginEInvoicesProviderInformations,
} from './plugin-e-invoice-providers.instance';

@ObjectType()
export class PluginEInvoicesPaginated extends PaginatedResponse(
  PluginEInvoicesEntity,
) {}

@Resolver(() => PluginEInvoicesEntity)
export class PluginEInvoicesResolver {
  constructor(private readonly service: PluginEInvoicesService) {}

  @Query(() => PluginEInvoicesPaginated)
  @Auth({ member: true })
  async getEInvoices(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.listEInvoices({
      member,
      query: normalizeQuery(args),
    });
  }

  @Mutation(() => PluginEInvoicesEntity)
  @Auth({ permission: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE })
  async createEInvoice(
    @Args('input') input: GenerateEInvoiceDataInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.createEInvoice({ member, input });
  }

  @Mutation(() => PluginEInvoicesEntity)
  @Auth({ permission: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE })
  async generateEInvoiceData(
    @Args('input') input: GenerateEInvoiceDataInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.generateInvoiceData({ member, input });
  }

  @Mutation(() => PluginEInvoicesEntity)
  @Auth({ permission: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE })
  async cancelEInvoice(
    @Args('invoiceId') invoiceId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.cancelEInvoice({ member, invoiceId });
  }

  @ResolveField(() => PluginEInvoiceProviderInformation, {
    name: 'providerInformation',
  })
  async resolveProviderInformation(@Parent() invoice: PluginEInvoicesEntity) {
    return pluginEInvoicesProviderInformations[invoice.provider];
  }
}
