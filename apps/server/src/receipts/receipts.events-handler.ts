import { AppEntity } from "../app.types";
import { EventsHandler, EventType } from "../events/events.types";
import { NotificationType } from "../notifications/notifications.types";
import { ReceiptEventData } from "./receipts.types";

export const receiptsEventsHandler: EventsHandler = {
  [EventType.RECEIPT_PAID]: [
    async (context) => {
      const receiptEventData = context.event.data as ReceiptEventData | null;
      if (!receiptEventData || !context.event.workspaceId) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: context.event.relatedEntities
          .filter((v) => v.entity === AppEntity.USERS)
          .map((v) => v.id),
        title: context.eventTitle,
        body: receiptEventData.customer
          ? 'noti_receipt_paid_body_with_customer'
          : 'noti_receipt_paid_body',
        bodyParams: receiptEventData,
        route: `/receipts/${context.event.ref}`,
      });
    },
  ],
  [EventType.RECEIPT_DISBURSEMENT]: [
    async (context) => {
      const receiptEventData = context.event.data as ReceiptEventData | null;
      if (!receiptEventData || !context.event.workspaceId) return;

      const body = [
        `Số tiền: ${receiptEventData.money.toLocaleString('vi')}`,
        `Nội dung: ${receiptEventData.note}`,
      ];

      await context.notifications.create({
        title: context.eventTitle,
        body: body.join(', '),
        userId: context.event.relatedEntities
          .filter((v) => v.entity === AppEntity.USERS)
          .map((v) => v.id)[0],
        workspaceId: context.event.workspaceId,
        persist: true,
        type: NotificationType.SUCCESS,
        route: `/receipts/${context.event.ref}`,
      });
    },
  ],
};