"use client";

import { Errored } from "@/components/errored";
import { CommentsIllustration } from "@/components/illustrations/comments";
import { useRouter } from "@/hooks/use-router";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { MessageBox } from "@/modules/message-boxes/message-box";
import { ContainerMessageBox } from "@/modules/message-boxes/message-box/message-box-container";
import { MessageBoxHead } from "@/modules/message-boxes/message-box/message-box-head";
import { MessageBoxList } from "@/modules/message-boxes/message-boxes";
import { MessageBoxesContext } from "@/modules/message-boxes/message-boxes-context";
import { MessageBoxesIntegrate } from "@/modules/message-boxes/message-boxes-integrate";
import { MessageBoxEntity } from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { type FC, type PropsWithChildren } from "react";
import { useQuery } from "../apis/use-query";

export const MessageBoxesLayout: FC<PropsWithChildren> = (props) => {
  const workspaceLayout = useWorkspaceLayout();

  const layout = useLayout();
  const router = useRouter();
  const params = useParams();
  const plugins = usePlugins();

  const messageBoxId = params.boxId as string;

  const messageBox = useQuery<MessageBoxEntity>({
    isSkip: !messageBoxId,
    route: `/message-boxes/${messageBoxId}`,
  });

  if (!plugins.isInitialized)
    return (
      <Stack p={16}>
        <Skeleton height={250} />
      </Stack>
    );

  if (!plugins.isHasPlugin) {
    return (
      <Stack p={16}>
        <MessageBoxesIntegrate />
      </Stack>
    );
  }

  return (
    <MessageBoxesContext.Provider
      value={{
        messageBox: messageBox.data ?? null,
        messageBoxId,
        open: (box: MessageBoxEntity) => {
          router.push(`/message-boxes/${box._id}`);
        },
        close: () => {
          router.push("/message-boxes");
        },
      }}
    >
      {(function () {
        if (layout.view === "mobile") {
          if (messageBoxId) {
            if (messageBox.isLoading) return <Skeleton height="50dvh" />;
            if (messageBox.error) return <Errored error={messageBox.error} />;

            return (
              <Stack style={{ height: workspaceLayout.bodyHeight }}>
                <MessageBox />
              </Stack>
            );
          }

          return (
            <Stack>
              <MessageBoxList />
            </Stack>
          );
        }

        const contentHeight = workspaceLayout.bodyHeight - 16 * 2;
        const contentWidth = workspaceLayout.bodyWidth - 16 * 2;

        return (
          <Stack p={16}>
            <Group
              style={{
                width: contentWidth,
                height: contentHeight,
              }}
            >
              <Card style={{ height: contentHeight }} shadow="xs" w={350} p={0}>
                <MessageBoxList />
              </Card>

              <Card style={{ height: contentHeight }} shadow="xs" flex={1} p={0}>
                {messageBox.data ? (
                  <Stack
                    gap={0}
                    style={{ height: contentHeight, overflow: "hidden" }}
                    align="stretch"
                  >
                    <Group style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}>
                      <MessageBoxHead key={messageBox.data._id} />
                    </Group>

                    <ContainerMessageBox />
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
