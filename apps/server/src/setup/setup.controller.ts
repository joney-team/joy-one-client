import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { getColor } from '../app.colors';
import { configs } from '../config/config';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { WorkspaceSubscriptionsService } from '../workspace-subscriptions/workspace-subscriptions.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SetupInheritInput } from './setup.types';

@Controller('setup')
export class SetupController {
  constructor(
    private readonly users: UsersService,
    private readonly subscriptions: SubscriptionsService,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceSubscriptions: WorkspaceSubscriptionsService,
  ) {}

  @Post('/inherit')
  async inherit(@Body() input: SetupInheritInput) {
    if (!configs.INHERIT_KEY)
      throw new ForbiddenException('System not supported yet.');

    if (input.inheritKey !== configs.INHERIT_KEY)
      throw new ForbiddenException('Invalid inherit key');

    const systemAdmin = await this.users.getByEmail(configs.SYS_ADMIN_EMAIL);
    const workspace = await this.workspaces.create(
      systemAdmin,
      {
        name: input.workspaceName,
        code: input.workspaceCode,
        type: input.workspaceType,
        appColor: input.appColor,
        appDomain: input.appDomain || configs.APP_URL,
        appName: input.appName || input.workspaceName,
      },
      true,
    );

    const subscriptions = await this.subscriptions.create({
      name: `Inherit`,
      color: getColor('primary'),
      limitMembers: 0,
      limitSocialConnections: 0,
      limitStorage: 0,
      pricePerMember: 0,
    });

    const workspaceSubscription = await this.workspaceSubscriptions.setFixed(
      workspace._id.toString(),
      {
        subscriptionId: subscriptions._id.toString(),
      },
    );

    return {
      workspace,
      subscription: workspaceSubscription,
    };
  }
}
