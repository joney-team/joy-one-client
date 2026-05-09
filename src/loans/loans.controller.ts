import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth, Member, RequestLocale } from '../app.decorators';
import { AppMessage } from '../app.message';
import { listBindData } from '../database/database.utils';
import { AppLocale } from '../lang/lang.types';
import { ReceiptsService } from '../receipts/receipts.service';
import { UserRole } from '../users/users.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  BulkArchiveLoansInput,
  BulkRejectLoanInput,
  BulkRevertRejectLoanInput,
  CalculatePaymentPlanDto,
  CreateLoanInput,
  FulfillLoanInput,
  ImportLoanInput,
  RejectLoanInput,
  SignLoanInput,
  UpdateLoanAmountInput,
  UpdateLoanAssetDataInput,
  UpdateLoanPackageInput,
} from './loans.inputs';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(
    private readonly service: LoansService,
    @Inject(forwardRef(() => ReceiptsService))
    private readonly receipts: ReceiptsService,
  ) {}

  @Get('/asset-estimations')
  @Auth({ member: true })
  async getAssetEstimations(@Member() member: WorkspaceMember) {
    return this.service.getAssetEstimations(member.workspaceId);
  }

  @Post('/asset-estimations')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async setLoanAssetEstimations(
    @Member() member: WorkspaceMember,
    @Body() dto: any,
  ) {
    return this.service.setAssetEstimations(member.workspaceId, dto);
  }

  @Post('/payment-plan')
  @Auth({ member: true })
  async calculatePaymentPlan(
    @Member() member: WorkspaceMember,
    @Body() dto: CalculatePaymentPlanDto,
  ) {
    const loanPackages = await this.service.getLoanPackages(member.workspace);
    const loanPackage = loanPackages.find((p) => p.id === dto.packageId);
    if (!loanPackage)
      throw new BadRequestException(AppMessage.LOAN_PACKAGE_NOT_FOUND);

    return this.service.calculatePaymentPlan({
      amount: dto.amount,
      loanPackage,
      startTime: dto.startTime,
    });
  }

  @Get()
  @Auth({ member: true, customerContact: true })
  async list(
    @Member() member: WorkspaceMember,
    @Query() query: any,
    @RequestLocale() locale?: AppLocale,
  ) {
    return listBindData({
      list: () => this.service.list({ query, member }),
      bindData: (data) => this.service.bindData(data, locale),
    });
  }

  @Get('/:loanId')
  @Auth({ member: true, customerContact: true })
  async get(
    @Param('loanId') loanId: string,
    @Member() member: WorkspaceMember,
    @RequestLocale() locale?: AppLocale,
  ) {
    return this.service
      .get({ id: loanId, member })
      .then((res) => this.service.bindData(res, locale));
  }

  @Get('/metadata/:code')
  async getMetadata(@Param('code') code: string) {
    return this.service.getMetadata(code);
  }

  @Get('/codes/:code')
  @Auth({ member: true, customerContact: true })
  async getByCode(
    @Param('code') code: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .getByCode({ code, member })
      .then((res) => this.service.bindData(res));
  }

  @Post()
  @Auth({ permission: WorkspacePermission.LOANS_CREATOR })
  async register(
    @Member() member: WorkspaceMember,
    @Body() dto: CreateLoanInput,
  ) {
    return this.service
      .create({
        workspace: member.workspace,
        member,
        input: dto,
      })
      .then((res) => this.service.bindData(res));
  }

  @Post('/import')
  @Auth({ permission: WorkspacePermission.LOANS_CREATOR })
  async import(
    @Member() member: WorkspaceMember,
    @Body() dto: ImportLoanInput,
  ) {
    return this.service
      .import(member, dto)
      .then((res) => this.service.bindData(res));
  }

  @Post('/:loanId/sign')
  @Auth({ permission: WorkspacePermission.LOANS_CREATOR })
  async sign(
    @Param('loanId') loanId: string,
    @Member() member: WorkspaceMember,
    @Body() dto: SignLoanInput,
  ) {
    return this.service
      .sign({ workspace: member.workspace, id: loanId, input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Put('/:loanId/amount')
  @Auth({ permission: WorkspacePermission.LOANS_CREATOR })
  async updateAmount(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
    @Body() input: UpdateLoanAmountInput,
  ) {
    return this.service
      .updateAmount({ member, id: loanId, input })
      .then((res) => this.service.bindData(res));
  }

  @Put('/:loanId/asset-data')
  @Auth({ permission: WorkspacePermission.LOANS_CREATOR })
  async updateAssetData(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
    @Body() input: UpdateLoanAssetDataInput,
  ) {
    return this.service
      .updateAssetData({ member, id: loanId, input })
      .then((res) => this.service.bindData(res));
  }

  @Put('/:loanId/package')
  @Auth({ permission: WorkspacePermission.LOANS_CREATOR })
  async updatePackage(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
    @Body() input: UpdateLoanPackageInput,
  ) {
    return this.service
      .updatePackage({ member, id: loanId, input })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:loanId/approve')
  @Auth({ permission: WorkspacePermission.LOANS_APPROVE })
  async approve(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service
      .approve({ member, id: loanId })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:loanId/revert-approve')
  @Auth({ permission: WorkspacePermission.LOANS_APPROVED_REVERTED })
  async revertApprove(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service.revertApprove({ member, id: loanId });
  }

  @Post('/:loanId/revert-fulfilled')
  @Auth({ permission: WorkspacePermission.LOANS_FULFILLED_REVERTED })
  async revertFulfilled(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service.revertFulfilled({ member, id: loanId });
  }

  @Post('/:loanId/reject')
  @Auth({ permission: WorkspacePermission.LOANS_APPROVE })
  async reject(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
    @Body() dto: RejectLoanInput,
  ) {
    return this.service
      .reject({ member, id: loanId, input: dto })
      .then((res) => this.service.bindData(res));
  }

  @Post('/bulk-reject')
  @Auth({ permission: WorkspacePermission.LOANS_APPROVE })
  async bulkReject(
    @Member() member: WorkspaceMember,
    @Body() dto: BulkRejectLoanInput,
  ) {
    return this.service.bulkReject({ member, input: dto });
  }

  @Post('/:loanId/fulfill')
  @Auth({ permission: WorkspacePermission.LOANS_FULFILL })
  async fulfill(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
    @Body() dto: FulfillLoanInput,
  ) {
    return this.service
      .fulfill({ member, input: dto, id: loanId })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:loanId/liquidation/calculate')
  @Auth({ permission: WorkspacePermission.LOANS_PAY })
  async calculateLiquidation(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service
      .liquidateCalculate({ member, id: loanId })
      .then((result) => result.calculated);
  }

  @Post('/:loanId/liquidation')
  @Auth({ permission: WorkspacePermission.LOANS_PAY })
  async liquidation(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service
      .liquidate({ member, id: loanId })
      .then((res) => this.receipts.bindData(res.liquidationReceipt));
  }

  @Post('/:loanId/revert-liquidation')
  @Auth({ permission: WorkspacePermission.LOANS_PAY })
  async revertLiquidation(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service.revertLiquidation({ member, id: loanId });
  }

  @Post('/:loanId/progress')
  @Auth({ member: true })
  async checkProgress(@Param('loanId') loanId: string) {
    return this.service.sync(loanId).then((res) => this.service.bindData(res));
  }

  @Post('/:loanId/health-check')
  @Auth({ member: true })
  async healthCheck(@Param('loanId') loanId: string) {
    return this.service.sync(loanId).then((res) => this.service.bindData(res));
  }

  @Delete('/archive')
  @Auth({ permission: WorkspacePermission.LOANS_ARCHIVE })
  async multiArchive(
    @Member() member: WorkspaceMember,
    @Body() input: BulkArchiveLoansInput,
  ) {
    return this.service.bulkArchive({ member, input: input });
  }

  @Delete('/:loanId')
  @Auth({ permission: WorkspacePermission.LOANS_ARCHIVE })
  async archive(
    @Member() member: WorkspaceMember,
    @Param('loanId') loanId: string,
  ) {
    return this.service
      .archive({ member, id: loanId })
      .then((res) => this.service.bindData(res));
  }

  @Patch('/sync-all')
  @Auth()
  async syncAll() {
    return this.service.syncAll();
  }

  @Patch('/sync-customer-branch')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async syncCustomerBranch() {
    return this.service.syncCustomerBranch();
  }
}
