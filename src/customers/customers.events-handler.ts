import { EventsHandler, EventType } from '../events/events.types';
import { CustomerEventData } from './customers.types';

export const customersEventsHandler: EventsHandler = {
  [EventType.CUSTOMER_NEW]: [
    async (context) => {
      const customerEventData = context.event.data as CustomerEventData | null;
      if (!context.event.workspaceId || !customerEventData) return;

      // Send notification to assignees
      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId],
        userIds: customerEventData.assigneeUserIds,
        title: 'new_customer',
        body: customerEventData.name,
        route: `/customers/${customerEventData.code}`,
      });

      await context.queueProducers.notifyNewCustomerToZaloGmfGroup({
        customerId: context.event.ref,
        workspaceId: context.event.workspaceId,
      });
    },
  ],
};
