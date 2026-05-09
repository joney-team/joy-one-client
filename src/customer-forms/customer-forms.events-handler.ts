import { EventsHandler, EventType } from "../events/events.types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles.types";

export const customerFormsEventsHandler: EventsHandler = {
  [EventType.CUSTOMER_FORM_NEW]: [
    async (context) => {
      const receivers = await context.workspaceMembers.getByPermission(
        context.event.workspaceId,
        WorkspacePermission.CUSTOMER_KYCS_MANAGER,
      );

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId],
        userIds: receivers.map((v) => v.userId),
        title: context.eventTitle,
        body: 'customer_form_new_body',
        bodyParams: context.event.data,
      });
    }
  ],
}