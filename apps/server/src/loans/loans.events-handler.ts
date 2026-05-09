import { EventHandler, EventType } from '../events/events.types';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { LoanEventData } from './loans.types';

export const loansEventsHandler: Partial<Record<EventType, EventHandler[]>> = {
  [EventType.LOANS_APPROVED]: [
    async (context) => {
      const loanEventData = context.event.data as LoanEventData | null;
      if (!context.event.workspaceId || !loanEventData) return;
      const members = await context.workspaceMembers.getByPermission(
        context.event.workspaceId,
        WorkspacePermission.LOANS_FULFILL,
      );

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId],
        userIds: members.map((v) => v.userId),
        title: context.eventTitle,
        body: 'loan_amount_params',
        bodyParams: loanEventData,
        route: `/loans/${loanEventData.code}`,
        ignoreAdmin: true,
      });
    },
  ],
  [EventType.LOANS_PENDING]: [
    async (context) => {
      const loanEventData = context.event.data as LoanEventData | null;
      if (!context.event.workspaceId || !loanEventData) return;
      const members = await context.workspaceMembers.getByPermissions(
        context.event.workspaceId,
        WorkspacePermission.LOANS_CREATOR,
        WorkspacePermission.LOANS_APPROVE,
      );

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId],
        userIds: members.map((v) => v.userId),
        title: context.eventTitle,
        body: 'loan_amount_params',
        bodyParams: loanEventData,
        route: `/loans/${loanEventData.code}`,
        ignoreAdmin: true,
      });
    },
  ],
  [EventType.LOANS_FULFILLED]: [
    async (context) => {
      const loanEventData = context.event.data as LoanEventData | null;
      if (!context.event.workspaceId || !loanEventData) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId],
        userIds: [],
        title: context.eventTitle,
        body: 'loan_amount_params',
        bodyParams: loanEventData,
        route: `/loans/${loanEventData.code}`,
      });
    },
  ],
  [EventType.CUSTOMER_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId || !context.event.ref) return;
      await context.loans.syncCustomer(context.event.ref);
    },
  ],
  [EventType.CUSTOMER_ARCHIVED]: [
    async (context) => {
      if (!context.event.workspaceId || !context.event.ref) return;
      await context.loans.syncCustomer(context.event.ref);
    },
  ],
};
