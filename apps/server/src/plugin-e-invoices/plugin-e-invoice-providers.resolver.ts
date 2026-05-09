import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { AppLocale } from 'src/lang/lang.types';
import { translate } from 'src/lang/lang.utils';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { Auth, Member, RequestLocale } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { PluginEInvoiceProviderEntity } from './entities/plugin-e-invoice-provider.entity';
import {
  PluginEInvoiceProviderInformation,
  pluginEInvoicesProviderInformations,
} from './plugin-e-invoice-providers.instance';
import { pluginEInvoiceTemplateVariables } from './plugin-e-invoice-variables';
import { PluginEInvoicesService } from './plugin-e-invoices.service';
import {
  CreatePluginEInvoiceProviderInput,
  UpdatePluginEInvoiceProviderInput,
} from './plugin-e-invoices.types';

@Resolver(() => PluginEInvoiceProviderEntity)
export class PluginEInvoiceProvidersResolver {
  constructor(private readonly service: PluginEInvoicesService) {}

  @Query(() => [PluginEInvoiceProviderInformation])
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async getEInvoicesProviderInformations() {
    return Object.entries(pluginEInvoicesProviderInformations).map(
      ([type, config]) => ({
        type,
        ...config,
      }),
    );
  }

  @Query(() => [PluginEInvoiceProviderEntity])
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async getEInvoiceProviders(@Member() member: WorkspaceMember) {
    return this.service.getProviders({ member }).then(async (providers) => {
      return Promise.all(
        providers.map(async (provider) =>
          this.service.bindProviderData(provider),
        ),
      );
    });
  }

  @Mutation(() => PluginEInvoiceProviderEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async createEInvoiceProvider(
    @Args('input') input: CreatePluginEInvoiceProviderInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.createProvider({ member, input });
  }

  @Mutation(() => PluginEInvoiceProviderEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateEInvoiceProvider(
    @Args('providerId') providerId: string,
    @Args('input') input: UpdatePluginEInvoiceProviderInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.updateProvider({ member, providerId, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async archiveEInvoiceProvider(
    @Args('providerId') providerId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.archiveProvider({ member, providerId });
  }

  @Mutation(() => PluginEInvoiceProviderEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async healthcheckEInvoicesProvider(
    @Args('providerId') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.healthcheckProvider({ id, member });
  }

  @Mutation(() => PluginEInvoiceProviderEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async resetEInvoicesProviderTemplates(
    @Args('providerId') providerId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.resetProviderTemplates({ member, providerId });
  }

  @Query(() => GraphQLJSONObject)
  async getEInvoiceTemplateVariables(@RequestLocale() locale: AppLocale) {
    return Object.entries(pluginEInvoiceTemplateVariables).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          ...value,
          description: translate(`e_invoice_variable_${key}`, locale),
        },
      }),
      {},
    );
  }

  @ResolveField(() => String, { name: 'name' })
  resolveProviderName(@Parent() provider: PluginEInvoiceProviderEntity) {
    return (
      pluginEInvoicesProviderInformations[provider.type]?.name || provider.type
    );
  }

  @ResolveField(() => String, { name: 'logo' })
  resolveProviderLogo(@Parent() provider: PluginEInvoiceProviderEntity) {
    return pluginEInvoicesProviderInformations[provider.type]?.logo || null;
  }
}
