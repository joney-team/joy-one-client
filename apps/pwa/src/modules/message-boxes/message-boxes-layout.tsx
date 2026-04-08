"use client";

import { CommentsIllustration } from "@/components/illustrations/comments";
import { MessageBox } from "@/modules/message-boxes/message-box/message-box";
import { MessageBoxList } from "@/modules/message-boxes/message-boxes";
import { MessageBoxesIntegrate } from "@/modules/message-boxes/message-boxes-integrate";
import { Trans } from "@lingui/react/macro";
import { Group, Skeleton, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useMemo, type FC } from "react";
import { useWorkspaceStat } from "../workspace-stats/hooks/useWorkspaceStat";
import { useLayout } from "@/layout/layout-context";

export const MessageBoxesLayout: FC = () => {
  const layout = useLayout();
  const params = useParams<{ boxId: string }>();
  const { workspaceStat, loading: workspaceStatLoading } = useWorkspaceStat();

  const isConnectedWithPlugins = useMemo(() => {
    return (
      workspaceStat &&
      workspaceStat.metaPages + workspaceStat.messageHubs + workspaceStat.zaloOas > 0
    );
  }, [workspaceStat]);

  if (workspaceStatLoading)
    return (
      <Stack p="md">
        <Skeleton height={250} />
      </Stack>
    );

  if (!isConnectedWithPlugins) {
    return (
      <Stack p="md">
        <MessageBoxesIntegrate />
      </Stack>
    );
  }

  if (layout.view === "mobile") {
    if (params.boxId) {
      return <MessageBox boxId={params.boxId} />;
    }

    return <MessageBoxList />;
  }

  return (
    <Group
      p="md"
      wrap="nowrap"
      gap="xs"
      w="var(--app-layout-body-width)"
      h="var(--app-layout-body-height)"
    >
      <Stack
        h="100%"
        mih="0"
        w={320}
        bg="var(--app-panel-background)"
        style={{
          borderRadius: "var(--mantine-radius-default)",
          overflow: "hidden",
          boxShadow: "var(--mantine-shadow-sm)",
        }}
      >
        <MessageBoxList />
      </Stack>

      <Stack
        h="100%"
        mih="0"
        flex={1}
        bg="var(--app-panel-background)"
        style={{
          borderRadius: "var(--mantine-radius-default)",
          overflow: "hidden",
          boxShadow: "var(--mantine-shadow-sm)",
        }}
      >
        {params.boxId ? (
          <Stack h="100%" w="100%" miw={0} style={{ overflow: "hidden" }}>
            <MessageBox key={params.boxId} boxId={params.boxId} />
          </Stack>
        ) : (
          <Stack
            style={{ height: "var(--app-layout-body-height)", overflow: "hidden" }}
            w="100%"
            justify="center"
            align="center"
          >
            <CommentsIllustration width={300} />
            <Text ta="center" c="gray" fz={12}>
              <Trans>Select a conversation to start</Trans>
            </Text>
          </Stack>
        )}
      </Stack>
    </Group>
  );
};
