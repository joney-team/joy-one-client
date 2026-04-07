"use client";

import { Errored } from "@/components/errored";
import { CommentsIllustration } from "@/components/illustrations/comments";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { MessageBox } from "@/modules/message-boxes/message-box/message-box";
import { ContainerMessageBox } from "@/modules/message-boxes/message-box/message-box-container";
import { MessageBoxHead } from "@/modules/message-boxes/message-box/message-box-head";
import { MessageBoxList } from "@/modules/message-boxes/message-boxes";
import { MessageBoxesContext } from "@/modules/message-boxes/message-boxes-context";
import { MessageBoxesIntegrate } from "@/modules/message-boxes/message-boxes-integrate";
import { useLazyQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useEffect, useMemo, type FC, type PropsWithChildren } from "react";
import { useWorkspaceStat } from "../workspace-stats/hooks/useWorkspaceStat";
import GetMessageBoxByIdDocument from "./graphql/getMessageBoxById.graphql";

export const MessageBoxesLayout: FC<PropsWithChildren> = (props) => {
  const layout = useLayout();
  const router = useRouter();
  const params = useParams<{ boxId: string }>();
  const { workspaceStat, loading: workspaceStatLoading } = useWorkspaceStat();

  const [getMessageBoxById, { data, loading, error }] = useLazyQuery(GetMessageBoxByIdDocument, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (params.boxId) {
      getMessageBoxById({ variables: { messageBoxId: params.boxId } });
    }
  }, [params.boxId]);

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

  return (
    <MessageBoxesContext.Provider
      value={{
        messageBox: data?.messageBox ?? null,
        messageBoxId: params.boxId!,
        open: (box) => {
          router.push(`/message-boxes/${box._id}`);
        },
        close: () => {
          router.push("/message-boxes");
        },
      }}
    >
      {(function () {
        if (layout.view === "mobile") {
          if (params.boxId) {
            if (loading && !data) return <Skeleton height="50dvh" />;
            if (error) return <Errored error={error} />;

            return (
              <Stack style={{ height: "var(--app-layout-body-height)" }}>
                <MessageBox key={params.boxId} />
              </Stack>
            );
          }

          return (
            <Stack>
              <MessageBoxList />
            </Stack>
          );
        }

        const contentHeight = `calc(var(--app-layout-body-height) - 16 * 2)`;
        const contentWidth = `calc(var(--app-layout-body-width) - 16 * 2)`;

        return (
          <Stack p="md">
            <Group
              style={{
                width: contentWidth,
                height: contentHeight,
              }}
            >
              <Card style={{ height: contentHeight }} shadow="xs" w={350} p={0}>
                <MessageBoxList key="list" />
              </Card>

              <Card style={{ height: contentHeight }} shadow="xs" flex={1} p={0}>
                {data?.messageBox ? (
                  <Stack
                    gap={0}
                    style={{ height: contentHeight, overflow: "hidden" }}
                    align="stretch"
                  >
                    <Group style={{ borderBottom: `1px solid var(--app-divider-color)` }}>
                      <MessageBoxHead key={data.messageBox._id} />
                    </Group>

                    <ContainerMessageBox key={data.messageBox._id} />
                  </Stack>
                ) : (
                  <Stack
                    style={{ height: contentHeight, overflow: "hidden" }}
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
              </Card>
            </Group>
          </Stack>
        );
      })()}

      {props.children}
    </MessageBoxesContext.Provider>
  );
};
