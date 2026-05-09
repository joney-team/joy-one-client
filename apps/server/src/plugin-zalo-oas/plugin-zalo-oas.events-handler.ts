import { EventsHandler, EventType } from "../events/events.types";

export const pluginZaloOasEventsHandler: EventsHandler = {
  [EventType.PLUGIN_ZALO_OA_INACTIVE]: [
    async (context) => {
      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        userIds: [],
        title: `Zalo Plugin mất kết nối, vui lòng kích hoạt lại`,
        body: `Token kết nối với Zalo OA đã hết hạn, vui lòng cung cấp lại token`,
        route: `/workspace-settings/plugins/zalo-oas`,
      });
    },
  ],
};