import { EventsHandler, EventType } from "../events/events.types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles.types";

export const customerKycEventsHandler: EventsHandler = {
  [EventType.CUSTOMER_KYC_PENDING]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      const relatedUsers = await context.workspaceMembers.getByPermission(
        context.event.workspaceId,
        WorkspacePermission.CUSTOMER_KYCS_MANAGER,
      );

      let body = [];
      body.push(`KH: ${context.event.data.customerName}`);

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        userIds: relatedUsers.map((v) => v.userId),
        title: `[KYC] Yêu cầu xác minh thông tin khách hàng`,
        body: body.join(', '),
        route: `/customers/${context.event.data.customerCode}`,
      });
    }
  ]
}