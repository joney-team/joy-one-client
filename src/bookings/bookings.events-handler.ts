import { EventsHandler, EventType } from '../events/events.types';
import { NotificationType } from '../notifications/notifications.types';
import { DateTime } from '../utils/date-time';
import { BookingEventData } from './bookings.types';

export const bookingsEventsHandler: EventsHandler = {
  [EventType.BOOKING_NEW]: [
    async (context) => {
      const bookingEventData = context.event.data as BookingEventData | null;
      if (!bookingEventData || !context.event.workspaceId) return;
      if (!bookingEventData.customerName) return;

      // Send notification to assignee
      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: [...bookingEventData.assigneeUserIds],
        title: context.eventTitle,
        body: `event_type_${context.event.type}`,
        bodyParams: bookingEventData,
        route: `/customers/${bookingEventData.customerCode}`,
      });

      // Send email to customer if start time of booking is more than 3 hour from now
      if (
        bookingEventData.customerEmail &&
        bookingEventData.dateTime - DateTime.getNowInSeconds() > 60 * 60 * 3
      ) {
        await context.mailer.sendWorkspaceWithTemplate({
          workspace: context.event.workspaceId,
          to: bookingEventData.customerEmail,
          template: 'customer_newBooking',
          params: bookingEventData,
        });
      }

      // Notify Zalo GMF Group
      if (!context.event.workspaceId) return;
      context.queueProducers.notifyNewBookingToZaloGmfGroup({
        bookingId: context.event.ref,
        eventType: context.event.type,
        workspaceId: context.event.workspaceId,
      });
    },
  ],
  [EventType.BOOKING_CHECKIN]: [
    async (context) => {
      const bookingEventData = context.event.data as BookingEventData | null;
      if (!bookingEventData || !context.event.workspaceId) return;
      if (!bookingEventData.customerName) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: bookingEventData.assigneeUserIds,
        title: context.eventTitle,
        body: 'booking_info_noti',
        bodyParams: bookingEventData,
        route: `/customers/${bookingEventData.customerCode}`,
      });
    },
  ],
  [EventType.BOOKING_IN_PROGRESS]: [
    async (context) => {
      const bookingEventData = context.event.data as BookingEventData | null;
      if (!bookingEventData || !context.event.workspaceId) return;
      if (!bookingEventData.customerName) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: [...bookingEventData.assigneeUserIds],
        title: context.eventTitle,
        body: 'booking_info_noti',
        bodyParams: bookingEventData,
        route: `/customers/${bookingEventData.customerCode}`,
      });
    },
  ],
  [EventType.BOOKING_CANCELLED]: [
    async (context) => {
      const bookingEventData = context.event.data as BookingEventData | null;
      if (!bookingEventData || !context.event.workspaceId) return;
      if (!bookingEventData.customerName) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: [...bookingEventData.assigneeUserIds],
        title: context.eventTitle,
        body: 'booking_cancelled_noti',
        bodyParams: bookingEventData,
        route: `/customers/${bookingEventData.customerCode}`,
        type: NotificationType.WARNING,
      });
    },
  ],
};
