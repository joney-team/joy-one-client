import { EventsHandler, EventType } from "../events/events.types";

export const usersEventsHandler: EventsHandler = {
  [EventType.USER_ONLINE]: [
    async (context) => {
      const members = await context.workspaceMembers.getAllByUserId(context.event.userId);
      members.forEach((member) => {
        context.queueProducers.captureEvent({
          ref: context.event._id.toString(),
          type: EventType.WORKSPACE_MEMBER_ONLINE,
          userId: context.event.userId,
          data: { memberId: member._id.toString() },
          workspaceId: member.workspaceId,
        });
      });
    },
  ],
  [EventType.USER_OFFLINE]: [
    async (context) => {
      const members = await context.workspaceMembers.getAllByUserId(context.event.userId);
      members.forEach((member) => {
        context.queueProducers.captureEvent({
          ref: context.event._id.toString(),
          type: EventType.WORKSPACE_MEMBER_OFFLINE,
          userId: context.event.userId,
          data: { memberId: member._id.toString() },
          workspaceId: member.workspaceId,
        });
      });
    },
  ],
  [EventType.USER_PROFILE_UPDATED]: [
    async (context) => {
      if (!context.event.userId) return;
      await context.workspaceMembers.syncFromUser(context.event.userId);
    },
  ],
}