"use client";

import { Avatar } from "@/components/avatar";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { Renderer } from "@/components/renderer";
import { WayPoint } from "@/components/way-point";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { getMessageBoxes } from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxStatus } from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useList } from "@/utils/use-list.util";
import { Box, Group, rgba, ScrollArea, Skeleton, Stack } from "@mantine/core";
import { IconAnalyze, IconPuzzle } from "@tabler/icons-react";
import { CardMessageBox } from "./message-box/message-box-card";
import { MessageBoxesIntegrate } from "./message-boxes-integrate";

export const MessageBoxList = () => {
  const plugins = usePlugins();
  const layout = useLayout();
  const workspace = useWorkspace();

  const boxes = useList({
    id: "message-boxes",
    fetch: (q) =>
      getMessageBoxes({
        ...q,
        sortLastInteractionAt: -1,
      }),
    events: [
      EventType.MESSAGE_NEW,
      EventType.MESSAGE_BOX_NEW,
      EventType.MESSAGE_BOX_IN_PROGRESS,
      EventType.MESSAGE_BOX_CLOSED,
      EventType.MESSAGE_BOX_WAITING,
      EventType.MESSAGE_BOX_REMOVED,
      EventType.MESSAGE_BOX_UPDATED,
      EventType.CUSTOMER_UPDATED,
    ],
  });

  const padding = layout.view === "mobile" ? 0 : 10;

  if (!plugins.isInitialized || !boxes.isInitialized || !boxes.isInitialized)
    return (
      <Group p={padding}>
        <Skeleton height={150} />
      </Group>
    );

  if (!plugins.isHasPlugin && workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)) {
    return <MessageBoxesIntegrate />;
  }

  return (
    <Stack gap={0} h="100%">
      <Group gap={5} p={8}>
        <ButtonSelect
          icon={IconAnalyze}
          label={t("status")}
          autoHideLabel
          value={boxes.query.status}
          options={Object.values(MessageBoxStatus).map((st) => ({
            label: t(`msg_boxes_status_${st}`),
            value: st,
          }))}
          onClear={() => boxes.removeQueries(["status"])}
          onChange={(status) => boxes.setQuery("status", status)}
        />

        <ButtonSelect
          icon={IconPuzzle}
          label={t("platform")}
          autoHideLabel
          value={boxes.query.platformId}
          options={[
            ...plugins.zaloOas.map((z) => ({
              label: z.name,
              value: z._id,
              leftSession: <Avatar pluginZaloOa={z} size={20} />,
            })),
            ...plugins.messageHubs.map((m) => ({
              label: m.name,
              value: m._id,
              leftSession: <Avatar src="/images/plugins-message-hubs.png" size={20} />,
            })),
            ...plugins.metaPages.map((m) => ({
              label: m.name,
              value: m._id,
              leftSession: <Avatar pluginMetaPage={m} size={20} />,
            })),
          ]}
          onClear={() => boxes.removeQueries(["platformId"])}
          onChange={(platformId) => boxes.setQuery("platformId", platformId)}
        />
      </Group>

      <ScrollArea flex={1} viewportProps={{ id: "message-boxes-list" }}>
        <Stack gap={12} pb={8} px={12}>
          <Empty message={t("no_msg")} visible={boxes.isEmpty} />
          <Errored error={boxes.error} visible={boxes.isHasError} />

          {boxes.isHasData &&
            boxes.data.map((box) => {
              return (
                <Stack key={box._id}>
                  <CardMessageBox box={box} />
                </Stack>
              );
            })}

          {boxes.isFetching && <Skeleton height={115} />}

          <WayPoint
            onReached={() => boxes.fetch(false)}
            enabled={boxes.isAbleToLoadMore}
            offset={200}
            scrollContainerId="message-boxes-list"
          />
        </Stack>

        <Renderer views={["desktop", "tablet"]}>
          <Box
            style={{
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(to bottom, ${rgba(`var(--color-bg-content)`, 0)}, ${rgba(
                `var(--color-bg-content)`,
                1
              )}, ${rgba(`var(--color-bg-content)`, 1)})`,
              height: 50,
              zIndex: 100,
            }}
          />
        </Renderer>
      </ScrollArea>
    </Stack>
  );
};
