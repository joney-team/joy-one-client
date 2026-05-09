import { EventsHandler, EventType } from "../events/events.types";

export const workspaceEventsHandler: EventsHandler = {
  [EventType.WORKSPACE_BRANCH_NEW]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaces.sync(context.event.workspaceId);
    }
  ],
  [EventType.WORKSPACE_BRANCH_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaces.sync(context.event.workspaceId);
    }
  ],
  [EventType.WORKSPACE_BRANCH_ARCHIVED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaces.sync(context.event.workspaceId);
    }
  ],
  [EventType.WORKSPACE_UPDATED]: [
    async (context) => {
      if (!context.event.workspaceId) return;
      await context.workspaces.sync(context.event.workspaceId);
    }
  ],
} 