import { AppMessage } from '../app.message';
import { useWorkspaceContext } from '../test/test.helpers';
import { UserType } from '../users/users.types';
import {
  WorkspacePermission,
  WorkspaceDefaultRoleId,
} from '../workspace-roles/workspace-roles.types';

describe('WorkspaceApiAppsService', () => {
  it(
    'Create new app',
    useWorkspaceContext(async (ctx) => {
      await ctx.services.workspaceApps.create(ctx.admin.member, {
        name: 'Test App',
        enabled: true,
        roleIds: [WorkspaceDefaultRoleId.ADMIN],
      });

      const app = await ctx.services.workspaceApps.list({
        member: ctx.admin.member,
      });
      const bindedApp = await ctx.services.workspaceApps.bindData(app.data[0]);
      expect(bindedApp.member.name).toBe('Test App');
      expect(bindedApp.member.roleIds).toEqual([WorkspaceDefaultRoleId.ADMIN]);
      expect(bindedApp.member.permissions).toEqual(
        Object.values(WorkspacePermission),
      );

      const userRelated = await ctx.services.users.get(app.data[0].userId);
      expect(userRelated.name).toBe('Test App');
      expect(userRelated.email).toBe(bindedApp.member.email);
      expect(userRelated.type).toBe(UserType.APP);

      const veriedKey = await ctx.services.workspaceApps.verifyKey(
        app.data[0].secretKey,
      );
      expect(veriedKey.member.name).toBe('Test App');
      expect(veriedKey.member.roleIds).toEqual([WorkspaceDefaultRoleId.ADMIN]);
      expect(veriedKey.member.permissions).toEqual(
        Object.values(WorkspacePermission),
      );
    }),
  );

  it(
    'Reset key',
    useWorkspaceContext(async (ctx) => {
      const app = await ctx.services.workspaceApps.create(ctx.admin.member, {
        name: 'Test App',
        enabled: true,
        roleIds: [WorkspaceDefaultRoleId.ADMIN],
      });

      const resetedKey = await ctx.services.workspaceApps.resetSecretKey({
        id: app._id.toString(),
        member: ctx.admin.member,
      });
      expect(resetedKey.authVersion).toBe(app.authVersion + 1);
      expect(resetedKey.secretKey).not.toBe(app.secretKey);

      await expect(
        ctx.services.workspaceApps.verifyKey(app.secretKey),
      ).rejects.toThrow(AppMessage.ACCESS_DENIED);
    }),
  );
});
