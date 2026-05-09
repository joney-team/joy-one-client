import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, Member, SDK, SdkOnly, Workspace } from '../app.decorators';
import { AppMessage } from '../app.message';
import { CustomerContactsService } from '../customer-contacts/customer-contacts.service';
import { SetCustomerContactsInput } from '../customer-contacts/customer-contacts.types';
import { CustomerKycsService } from '../customer-kycs/customer-kycs.service';
import { CustomerKycInput } from '../customer-kycs/customer-kycs.types';
import {
  CustomerDeviceDto,
  CustomerInput,
} from '../customers/customers.inputs';
import { CustomersService } from '../customers/customers.service';
import { listBindData } from '../database/database.utils';
import {
  CalculatePaymentPlanDto,
  CreateLoanInput,
  SignLoanInput,
} from '../loans/loans.inputs';
import { LoansService } from '../loans/loans.service';
import { getLocations } from '../locations/locations.utils';
import { PluginBanksService } from '../plugin-banks/plugin-banks.service';
import { PluginZaloOasService } from '../plugin-zalo-oas/plugin-zalo-oas.service';
import { PluginZaloOaSendZnsInput } from '../plugin-zalo-oas/plugin-zalo-oas.types';
import { ReceiptsService } from '../receipts/receipts.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspaceSdkEntity } from './workspace-sdks.entity';
import { WorkspaceSdksService } from './workspace-sdks.service';
import { CreateWorkspaceSdkDto } from './workspace-sdks.types';

@Controller('workspace-sdks')
@ApiTags('Workspace SDKs')
export class WorkspaceSdksController {
  constructor(
    private readonly service: WorkspaceSdksService,
    private readonly customers: CustomersService,
    private readonly customerKycs: CustomerKycsService,
    private readonly customerContacts: CustomerContactsService,
    private readonly loans: LoansService,
    private readonly pluginBanks: PluginBanksService,
    private readonly zaloOas: PluginZaloOasService,
    private readonly workspaceSettings: WorkspaceSettingsService,
    private readonly receipts: ReceiptsService,
  ) {}

  @Get('/ping')
  @SdkOnly()
  async ping(@Workspace() ws: WorkspaceEntity, @SDK() sdk: WorkspaceSdkEntity) {
    return {
      name: sdk.name,
      workspace: ws.name,
    };
  }

  @Get('/settings')
  @SdkOnly()
  async settings(@Workspace() ws: WorkspaceEntity) {
    return this.workspaceSettings.get(ws._id.toString());
  }

  @Get()
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ query, member }).then(async (res) => ({
      ...res,
      data: await Promise.all(
        res.data.map((sdk) => this.service.bindData(sdk)),
      ),
    }));
  }

  @Post()
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async create(
    @Member() member: WorkspaceMember,
    @Body() dto: CreateWorkspaceSdkDto,
  ) {
    return this.service
      .create(member, dto)
      .then((sdk) => this.service.bindData(sdk));
  }

  @Delete(':id')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async remove(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.remove(member, id);
  }

  @Get('/locations')
  @SdkOnly()
  async locations() {
    return getLocations();
  }

  @Get('/banks')
  @SdkOnly()
  async banks() {
    const { results, total } = await this.pluginBanks.getBankInformations();

    return {
      data: results,
      count: total,
    };
  }

  // ======================= Start Customers =======================
  @Get('/customers')
  @SdkOnly()
  async customersList(
    @Workspace() workspace: WorkspaceEntity,
    @Query() query: any,
  ) {
    return listBindData({
      list: async () => {
        const { total, results } = await this.customers.list({
          workspace,
          query,
        });
        return { count: total, data: results };
      },
      bindData: (item) => this.customers.bindData(item),
    });
  }

  @Get('/customers/:id')
  @SdkOnly()
  async customersGet(
    @Param('id') id: string,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customers
      .get({ id, workspace })
      .then((res) => this.customers.bindData(res));
  }

  @Post(`/customers`)
  @SdkOnly()
  async customersCreate(
    @Workspace() workspace: WorkspaceEntity,
    @Body() input: CustomerInput,
  ) {
    return this.customers
      .create({ input, workspace })
      .then((res) => this.customers.bindData(res));
  }

  @Put('/customers/:id')
  @SdkOnly()
  async customersUpdate(
    @Param('id') _id: string,
    @Body() dto: CustomerInput,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customers
      .update({ id: _id, input: dto, workspace })
      .then((res) => this.customers.bindData(res));
  }

  @Post(`/customers/:customerId/devices`)
  @SdkOnly()
  async addCustomerDevice(
    @Param('customerId') customerId: string,
    @Body() dto: CustomerDeviceDto,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customers
      .addDevice({ id: customerId, dto, workspace })
      .then((res) => this.customers.bindData(res));
  }

  @Delete(`/customers/:customerId/devices/all`)
  @SdkOnly()
  async removeAllDevices(
    @Param('customerId') customerId: string,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customers
      .removeAllDevices({ id: customerId, workspace })
      .then((res) => this.customers.bindData(res));
  }

  @Delete(`/customers/:customerId/devices`)
  @SdkOnly()
  async removeCustomerDevice(
    @Param('customerId') customerId: string,
    @Body() dto: CustomerDeviceDto,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customers
      .removeDevice({ id: customerId, dto, workspace })
      .then((res) => this.customers.bindData(res));
  }

  @Get('/customer-kycs/:customerId')
  @SdkOnly()
  async customerKycsGet(@Param('customerId') customerId: string) {
    return this.customerKycs
      .get(customerId)
      .then((res) => this.customerKycs.bindData(res));
  }

  @Post('/customer-kycs/:customerId')
  @SdkOnly()
  async customerKycsRegister(
    @Body() dto: CustomerKycInput,
    @Param('customerId') customerId: string,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customerKycs
      .register({ customerId, input: dto, workspace })
      .then((res) => this.customerKycs.bindData(res));
  }

  @Get('/customer-contacts/:customerId')
  @SdkOnly()
  async customerContactsGet(
    @Param('customerId') customerId: string,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customerContacts.get({ customerId, workspace });
  }

  @Post('/customer-contacts/:customerId')
  @SdkOnly()
  async customerContactsSet(
    @Param('customerId') customerId: string,
    @Body() input: SetCustomerContactsInput,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.customerContacts.set({ customerId, input, workspace });
  }
  // ======================= End Customers =======================

  // ======================= Start Loans =======================
  @Get('/loans')
  @SdkOnly()
  async loansList(
    @Query() query: any,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.loans.list({ query, workspace }).then(async (res) => ({
      ...res,
      data: await Promise.all(
        res.data.map((item) => this.loans.bindData(item)),
      ),
    }));
  }

  @Post('/loans/payment-plan')
  @SdkOnly()
  async calculateLoanPaymentPlan(
    @Body() dto: CalculatePaymentPlanDto,
    @Workspace() ws: WorkspaceEntity,
  ) {
    const loanPackages = await this.loans.getLoanPackages(ws);
    const loanPackage = loanPackages.find((p) => p.id === dto.packageId);
    if (!loanPackage)
      throw new BadRequestException(AppMessage.LOAN_PACKAGE_NOT_FOUND);
    return this.loans.calculatePaymentPlan({
      amount: dto.amount,
      loanPackage,
    });
  }

  @Get('/loans/asset-estimations')
  @SdkOnly()
  async loanAssetEstimations(@Workspace() workspace: WorkspaceEntity) {
    return this.loans.getAssetEstimations(workspace._id.toString());
  }

  @Get('/loans/codes/:code')
  @SdkOnly()
  async getLoanByCode(@Param('code') code: string) {
    return this.loans
      .getByCode({ code })
      .then((res) => this.loans.bindData(res));
  }

  @Get('/loans/:id')
  @SdkOnly()
  async getLoan(@Param('id') id: string) {
    return this.loans.get({ id }).then((res) => this.loans.bindData(res));
  }

  @Post('/loans')
  @SdkOnly()
  async loansRegister(
    @Body() dto: CreateLoanInput,
    @Workspace() ws: WorkspaceEntity,
  ) {
    return this.loans
      .create({ workspace: ws, input: dto })
      .then((res) => this.loans.bindData(res));
  }

  @Post('/loans/:loanId/sign')
  @SdkOnly()
  async loansSign(
    @Body() input: SignLoanInput,
    @Workspace() workspace: WorkspaceEntity,
    @Param('loanId') loanId: string,
  ) {
    return this.loans
      .sign({ workspace, id: loanId, input })
      .then((res) => this.loans.bindData(res));
  }
  // ======================= End Loans =======================

  // ======================= Start Plugins =======================
  @Post('/plugins/zalo-oas/send-zns')
  @SdkOnly()
  async sendZNS(
    @Body() input: PluginZaloOaSendZnsInput,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.zaloOas
      .sendZNS({ workspace, input })
      .then((res) => ({ sent: res }));
  }
  // ======================= End Plugins =======================

  // ======================= Start Receipts =======================
  @Get('/receipts')
  @SdkOnly()
  async receiptList(
    @Query() query: any,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.receipts.list({ query, workspace }).then(async (res) => ({
      count: res.total,
      data: await Promise.all(
        res.results.map((item) => this.receipts.bindData(item)),
      ),
    }));
  }

  @Get('/receipts/:id')
  @SdkOnly()
  async receiptDetail(
    @Param('id') id: string,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    const receipt = await this.receipts.get({ id });
    if (receipt.workspaceId !== workspace._id.toString())
      throw new NotFoundException();
    return this.receipts.bindData(receipt);
  }
  // ======================= End Receipts =======================
}
