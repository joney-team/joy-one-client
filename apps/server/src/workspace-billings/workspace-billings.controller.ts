import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { configs } from '../config/config';
import { Auth, Member, User } from '../app.decorators';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../users/users.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceBillingsService } from './workspace-billings.service';
import {
  WorkspaceBillingDepositDto,
  WorkspaceBillingPaymentDto,
} from './workspace-billings.types';
@Controller('workspace-billings')
export class WorkspaceBillingsController {
  constructor(
    private service: WorkspaceBillingsService,
    private workspaces: WorkspacesService,
  ) {}

  @Get('/bank-account')
  async bank() {
    return {
      accountName: configs.BILLING_ACCOUNT_NAME,
      accountNumber: configs.BILLING_ACCOUNT_NUMBER,
      accountBankId: configs.BILLING_ACCOUNT_BANK_ID,
    };
  }

  @Get('/admin/:workspaceId/balance')
  @Auth({ userRoles: [UserRole.ADMIN, UserRole.BUSINESS_PARTNER] })
  async getBalance(@Param('workspaceId') workspaceId: string) {
    const workspace = await this.workspaces.get(workspaceId);
    return this.service.report({ workspace });
  }

  @Post('/admin/:workspaceId/deposit')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async deposit(
    @Param('workspaceId') workspaceId: string,
    @User() user: UserEntity,
    @Body() dto: WorkspaceBillingDepositDto,
  ) {
    return this.service.deposit(workspaceId, {
      ...dto,
      manualSettlementByUserId: user._id.toString(),
    });
  }

  @Post('/admin/:workspaceId/payment')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async addPayment(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: WorkspaceBillingPaymentDto,
  ) {
    return this.service.addPayment(workspaceId, dto);
  }

  @Get('/admin')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async adminList(@Query() query: any) {
    return this.service.list({ query }).then(async (res) => ({
      ...res,
      data: await Promise.all(
        res.data.map(async (billing) =>
          this.service.bindData(billing, { getWorkspace: true }),
        ),
      ),
    }));
  }

  @Get('/balance')
  @Auth({ member: true })
  async getBalanceOfWorkspace(@Member() member: WorkspaceMember) {
    return this.service.report({ member });
  }

  @Get()
  @Auth({ permission: WorkspacePermission.WORKSPACE_BILLINGS_MANAGER })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return this.service.list({ query, member }).then(async (res) => ({
      ...res,
      data: await Promise.all(
        res.data.map(async (billing) => this.service.bindData(billing)),
      ),
    }));
  }
}
