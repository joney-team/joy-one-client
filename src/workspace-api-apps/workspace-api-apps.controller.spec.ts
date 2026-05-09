import { UseWorkspaceContext, useWorkspaceContext } from '../test/test.helpers';
import { WorkspaceDefaultRoleId } from '../workspace-roles/workspace-roles.types';
import { WorkspaceApiAppEntity } from './entities/workspace-api-app.entity';

interface UseWorkspaceAppsContext extends UseWorkspaceContext {
  workspaceApiApp: WorkspaceApiAppEntity;
}

const useWorkspaceApiAppsContext = (
  handler: (ctx: UseWorkspaceAppsContext) => Promise<void>,
) => {
  return useWorkspaceContext(async (ctx) => {
    const app = await ctx.services.workspaceApps.create(ctx.admin.member, {
      name: 'Test App',
      enabled: true,
      roleIds: [WorkspaceDefaultRoleId.ADMIN],
    });

    const bindedApp = await ctx.services.workspaceApps.bindData(app);
    await handler({ ...ctx, workspaceApiApp: bindedApp });
  });
};

describe('WorkspaceApiAppsController', () => {
  it(
    'Guard success',
    useWorkspaceApiAppsContext(async (ctx) => {
      await ctx.req
        .get(`/workspace-api-apps/info`)
        .set('Authorization', `Bearer ${ctx.workspaceApiApp.secretKey}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toEqual(ctx.workspaceApiApp._id.toString());
        });
    }),
  );

  it(
    'Guard failed',
    useWorkspaceApiAppsContext(async (ctx) => {
      await ctx.req.get(`/workspace-api-apps/info`).expect(401);

      await ctx.req
        .get(`/workspace-api-apps/info`)
        .set('Authorization', `Bearer app_fakeToken`)
        .expect(403);
    }),
  );

  it(
    'API - Products',
    useWorkspaceApiAppsContext(async (ctx) => {
      await ctx.req
        .get(`/products`)
        .set('Authorization', `Bearer ${ctx.workspaceApiApp.secretKey}`)
        .expect(200);
    }),
  );
});
