import { EventsHandler, EventType } from '../events/events.types';

export const workspaceMembersEventsHandler: EventsHandler = {
  [EventType.WORKSPACE_MEMBER_JOINED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      const admins = await context.workspaceMembers.getAdmins(
        context.event.workspaceId,
      );
      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId],
        userIds: admins.map((v) => v.userId),
        title: context.eventTitle,
        body: 'member_joined',
        bodyParams: context.event.data,
      });
    },
  ],
  [EventType.USER_PROFILE_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId || !context.event.ref) return;
      await context.workspaceMembers.syncFromUser(context.event.ref);
    },
  ],
  [EventType.WORKSPACE_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaceMembers.syncWorkspace(context.event.workspaceId);
    },
  ],
  [EventType.WORKSPACE_SETTING_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaceMembers.syncWorkspace(context.event.workspaceId);
    },
  ],
  [EventType.WORKSPACE_ROLES_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      const members = await context.workspaceMembers.getByRole({
        workspaceId: context.event.workspaceId,
        roleId: context.event.ref,
      });
      await Promise.all(
        members.map((member) =>
          context.workspaceMembers.syncFromMember(member),
        ),
      );
    },
  ],
  [EventType.WORKSPACE_ROLES_REMOVED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      const members = await context.workspaceMembers.getByRole({
        workspaceId: context.event.workspaceId,
        roleId: context.event.ref,
      });
      await Promise.all(
        members.map((member) =>
          context.workspaceMembers.syncFromMember(member),
        ),
      );
    },
  ],
  [EventType.WORKSPACE_BRANCH_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaceMembers.syncWorkspace(context.event.workspaceId);
    },
  ],
  [EventType.WORKSPACE_BRANCH_ARCHIVED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaceMembers.syncWorkspace(context.event.workspaceId);
    },
  ],
};
