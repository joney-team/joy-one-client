import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth, Member, Workspace } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceSubscriptionsService } from './workspace-subscriptions.service';
import {
  CalculateWorkspaceSubscriptionBillingsDto,
  SelectWorkspaceSubscriptionDto,
  SetFixedWorkspaceSubscriptionDto,
} from './workspace-subscriptions.types';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';

@Controller('workspace-subscriptions')
export class WorkspaceSubscriptionsController {
  constructor(private service: WorkspaceSubscriptionsService) {}

  @Get()
  @Auth({ member: true })
  async getByWorkspace(@Workspace() workspace: WorkspaceEntity) {
    return this.service.get(workspace._id.toString());
  }

  @Get('/:workspaceId')
  async get(@Param('workspaceId') workspaceId: string) {
    return this.service.get(workspaceId);
  }

  @Post('/select')
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async select(
    @Member() member: WorkspaceMember,
    @Body() dto: SelectWorkspaceSubscriptionDto,
  ) {
    return this.service.select(member.workspaceId, dto);
  }

  @Post('/calculate-billings')
  async calculateBillings(
    @Body() dto: CalculateWorkspaceSubscriptionBillingsDto,
  ) {
    return this.service.calculateBilling(dto);
  }

  @Post('/admin/:workspaceId/billings')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async handleBillings(@Param('workspaceId') workspaceId: string) {
    return this.service.handleBillings(workspaceId);
  }

  @Post('/admin/:workspaceId/fixed')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async adminSelect(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: SetFixedWorkspaceSubscriptionDto,
  ) {
    return this.service.setFixed(workspaceId, dto);
  }
}
