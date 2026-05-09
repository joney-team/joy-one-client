import { EventHandler, EventsHandler, EventType } from '../events/events.types';

const aggregateWorkspaceStats: EventHandler = async (context) => {
  if (!context.event.workspaceId) return;

  await context.queueProducers.aggregateWorkspaceStats({
    workspaceId: context.event.workspaceId,
  });
};

export const workspaceStatsEventsHandler: EventsHandler = {
  [EventType.PLUGIN_META_PAGES_UPDATED]: [aggregateWorkspaceStats],
  [EventType.PLUGIN_META_PAGES_DISCONNECTED]: [aggregateWorkspaceStats],
  [EventType.PLUGIN_ZALO_OA_UPDATED]: [aggregateWorkspaceStats],
  [EventType.PLUGIN_ZALO_OA_REMOVED]: [aggregateWorkspaceStats],
  [EventType.PLUGIN_MESSAGE_HUBS_NEW]: [aggregateWorkspaceStats],
  [EventType.PLUGIN_MESSAGE_HUBS_REMOVED]: [aggregateWorkspaceStats],
};
