"use client";

import { Avatar } from "@/components/avatar";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { Renderer } from "@/components/renderer";
import { WayPoint } from "@/components/way-point";
import { EventType, MessageBoxStatus } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans, useLingui } from "@lingui/react/macro";
import { Box, Group, rgba, ScrollArea, Skeleton, Stack } from "@mantine/core";
import { IconAnalyze, IconPuzzle } from "@tabler/icons-react";
import { MessageBoxFragment } from "./graphql/fragmentMessageBox.graphql";
import GetMessageBoxesDocument from "./graphql/getMessageBoxes.graphql";
import { CardMessageBox } from "./message-box/message-box-card";
import { messageBoxStatuses } from "./message-boxes-contants";
import { MessageBoxesIntegrate } from "./message-boxes-integrate";

export const MessageBoxList = () => {
  const plugins = usePlugins();
  const layout = useLayout();
  const workspace = useWorkspace();
  const { t } = useLingui();

  const boxes = useGraphqlList<MessageBoxFragment>({
    id: "message-boxes",
    query: GetMessageBoxesDocument,
    params: {
      sortLastInteractionAt: -1,
    },
    events: [
      EventType.MessageNew,
      EventType.MessageBoxNew,
      EventType.MessageBoxInProgress,
      EventType.MessageBoxClosed,
      EventType.MessageBoxWaiting,
      EventType.MessageBoxRemoved,
      EventType.MessageBoxUpdated,
      EventType.CustomerUpdated,
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
          label={<Trans>Status</Trans>}
          autoHideLabel
          value={boxes.params.status}
          options={(Object.values(MessageBoxStatus) as MessageBoxStatus[]).map((st) => ({
            label: t(messageBoxStatuses[st].label),
            value: st,
          }))}
          onClear={() => boxes.removeParams(["status"])}
          onChange={(status) => boxes.setParams({ status })}
        />

        <ButtonSelect
          icon={IconPuzzle}
          label={<Trans>Platform</Trans>}
          autoHideLabel
          value={boxes.params.platformId}
          options={[
            ...plugins.zaloOas.map((z) => ({
              label: z.info.name,
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
          onClear={() => boxes.removeParams(["platformId"])}
          onChange={(platformId) => boxes.setParams({ platformId })}
        />
      </Group>

      <ScrollArea flex={1} viewportProps={{ id: "message-boxes-list" }}>
        <Stack gap={12} pb={8} px={12}>
          <Empty message={<Trans>No messages</Trans>} visible={boxes.isEmpty} />
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
            onReached={boxes.loadMore}
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
                1,
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
