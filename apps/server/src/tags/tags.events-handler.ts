import { EventsHandler, EventType } from "../events/events.types";

export const tagsEventsHandler: EventsHandler = {
  [EventType.TAGS_ARCHIVED]: [
    async (context) => {
      if (!context.event.workspaceId) return;

      const relatedTasks = await context.tasks.list({
        query: {
          tagFolderId: context.event.ref,
        },
        workspaceId: context.event.workspaceId,
      });

      const member = await context.workspaceMembers.get({
        userId: context.event.userId,
        workspaceId: context.event.workspaceId,
      });

      // Remove tagFolderId from related tasks
      await context.tasks.bulkUpdate({
        member,
        items: relatedTasks.results.map((t) => ({
          ...t,
          _id: t._id.toString(),
          tagFolderId: null,
        })),
      });
    }
  ],
}