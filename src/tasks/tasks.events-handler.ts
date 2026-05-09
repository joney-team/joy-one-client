import { EventsHandler, EventType } from "../events/events.types";
import { TaskEventData } from "./tasks.types";

export const tasksEventsHandler: EventsHandler = {
  [EventType.TASK_NEW]: [
    async (context) => {
      const taskEventData = context.event.data as TaskEventData | null;
      if (!context.event.workspaceId || !taskEventData) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: taskEventData.relatedUserIds,
        title: context.eventTitle,
        body: 'new_task_noti',
        bodyParams: taskEventData,
        route: `/tasks/${taskEventData.code}`,
        ignoreAdmin: true,
      });
    }
  ],
  [EventType.TASK_STATUS_UPDATED]: [
    async (context) => {
      const taskEventData = context.event.data as (TaskEventData & { fromStatus: string, toStatus: string }) | null;
      if (!context.event.workspaceId || !taskEventData || !context.event.ref || !taskEventData.fromStatus || !taskEventData.toStatus) return;

      const task = await context.tasks.get({ _id: context.event.ref, workspaceId: context.event.workspaceId });
      const statuses = await context.tasks.getTaskStatuses(task);
      const fromTaskStatus = statuses.find(s => s.id === taskEventData.fromStatus)?.name;
      const toTaskStatus = statuses.find(s => s.id === taskEventData.toStatus)?.name;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: taskEventData.relatedUserIds,
        title: "task_status_updated_title",
        titleParams: taskEventData,
        body: 'task_status_updated_body',
        bodyParams: {
          fromTaskStatus,
          toTaskStatus,
        },
        route: `/tasks/${taskEventData.code}`,
        ignoreAdmin: true,
      });
    }
  ],
  [EventType.TASK_ASSIGNED]: [
    async (context) => {
      const taskEventData = context.event.data as TaskEventData | null;
      if (!context.event.workspaceId || !taskEventData) return;

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        ignoreUserIds: [context.event.userId!],
        userIds: taskEventData.relatedUserIds,
        title: context.eventTitle,
        body: 'task_assigned',
        bodyParams: taskEventData,
        route: `/tasks/${taskEventData.code}`,
        ignoreAdmin: true,
      });
    }
  ],
}