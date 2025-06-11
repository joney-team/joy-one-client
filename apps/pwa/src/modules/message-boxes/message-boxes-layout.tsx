"use client";

import { type FC, type PropsWithChildren, useEffect, useRef, useState } from "react";
import { CommentsIllustration } from "@/components/illustrations/comments";
import { useRouter } from "@/hooks/use-router";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { MessageBox } from "@/modules/message-boxes/message-box";
import { ContainerMessageBox } from "@/modules/message-boxes/message-box/message-box-container";
import { MessageBoxHead } from "@/modules/message-boxes/message-box/message-box-head";
import { MessageBoxList } from "@/modules/message-boxes/message-boxes";
import { MessageBoxesContext } from "@/modules/message-boxes/message-boxes-context";
import { MessageBoxesIntegrate } from "@/modules/message-boxes/message-boxes-integrate";
import { getMessageBox, getMessageBoxesByIds } from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxTabs } from "@/modules/message-boxes/message-boxes-tabs";
import { MessageBoxEntity } from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { wait } from "@/utils/common.utils";
import { Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";

export const MessageBoxesLayout: FC<PropsWithChildren> = (props) => {
  const [version, _forceUpdate] = useState(0);
  const forceUpdate = () => _forceUpdate((v) => v + 1);
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const cacheKey = `message_box_ids_${workspace.userMember._id}_v1`;

  const layout = useLayout();
  const router = useRouter();
  const params = useParams();
  const plugins = usePlugins();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const messageBoxId = params.boxId as string;
  const messageBoxIds = useRef<string[]>([]);
  const messageBoxes = useRef<MessageBoxEntity[]>([]);

  const scrollToActiveTab = (id: string, delay = 100) => {
    setTimeout(() => {
      const element = document.getElementById(`tab_${id}`);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, delay);
  };

  useEffect(() => {
    if (isInitialized) {
      const isMissingMessageBoxes = messageBoxIds.current.filter(
        (id) => !messageBoxes.current.find((box) => box._id === id)
      );

      if (isMissingMessageBoxes.length > 0) {
        getMessageBoxesByIds(isMissingMessageBoxes)
          .then((data) => {
            messageBoxes.current = [
              ...messageBoxes.current.filter((box) => !isMissingMessageBoxes.includes(box._id)),
              ...data,
            ];
            forceUpdate();
          })
          .catch(() => {});
      }
    }
  }, [isInitialized, messageBoxIds.current]);

  useEffect(() => {
    if (isInitialized && messageBoxId && !messageBoxIds.current.includes(messageBoxId)) {
      messageBoxIds.current.push(messageBoxId);
      forceUpdate();
    }
  }, [messageBoxId, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(cacheKey, JSON.stringify(messageBoxIds.current));
    }
  }, [isInitialized, version]);

  const initialize = async () => {
    try {
      setIsReady(false);
      const _messageBoxIds = localStorage.getItem(cacheKey);
      if (_messageBoxIds) {
        const _ids = JSON.parse(_messageBoxIds);
        const boxes = await getMessageBoxesByIds(_ids);
        messageBoxes.current = boxes;
        messageBoxIds.current = boxes.map((box) => box._id);

        // Auto open first message box on desktop
        if (!messageBoxId && messageBoxIds.current.length > 0 && layout.view === "desktop") {
          router.push(`/message-boxes/${messageBoxIds.current[0]}`);
        }
        forceUpdate();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitialized(true);
      await wait(200);
      setIsReady(true);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitialized && messageBoxId) {
      scrollToActiveTab(messageBoxId);
    }
  }, [isInitialized, messageBoxId]);

  useEventsListener(
    [EventType.MESSAGE_BOX_UPDATED],
    (e) => {
      const isExisted = messageBoxes.current.find((box) => box._id === e.ref);
      if (isExisted && e.ref) {
        getMessageBox(e.ref)
          .then((data) => {
            messageBoxes.current = messageBoxes.current.map((box) =>
              box._id === e.ref ? data : box
            );
            forceUpdate();
          })
          .catch(() => {});
      }
    },
    [messageBoxIds.current.toString()]
  );

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

  const messageBox = messageBoxes.current.find((box) => box._id === messageBoxId) || null;

  return (
    <MessageBoxesContext.Provider
      value={{
        isInitialized,
        messageBoxes: messageBoxes.current,
        messageBoxIds: messageBoxIds.current,
        messageBox,
        messageBoxId,
        open: (box: MessageBoxEntity) => {
          const isExisted = messageBoxes.current.find((b) => b._id === box._id);
          if (!isExisted) messageBoxes.current.push(box);
          router.push(`/message-boxes/${box._id}`);
        },
        close: (box: MessageBoxEntity) => {
          if (messageBoxId === box._id) {
            const index = messageBoxIds.current.findIndex((b) => b === box._id);
            const previousBoxId = messageBoxIds.current[index - 1];
            const nextBoxId = messageBoxIds.current[index + 1];
            router.push(
              previousBoxId || nextBoxId
                ? `/message-boxes/${previousBoxId || nextBoxId}`
                : "/message-boxes"
            );
          }

          messageBoxIds.current = messageBoxIds.current.filter((id) => id !== box._id);
          forceUpdate();
        },
      }}
    >
      {(function () {
        if (!isReady || layout.isResizing)
          return (
            <Stack p={16}>
              <Skeleton height={150} />
            </Stack>
          );

        if (layout.view === "mobile") {
          if (messageBox)
            return (
              <Stack
                id="mobile-message-box"
                style={{
                  height: workspaceLayout.bodyHeight,
                }}
              >
                <MessageBox />
              </Stack>
            );

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
                {messageBoxIds.current.length > 0 ? (
                  <Stack
                    gap={0}
                    style={{ height: contentHeight, overflow: "hidden" }}
                    align="stretch"
                  >
                    <MessageBoxTabs />

                    <Stack flex={1} w="100%" gap={0}>
                      <Group
                        style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}
                        w="100%"
                      >
                        {messageBox && <MessageBoxHead key={messageBox._id} />}
                      </Group>

                      <ContainerMessageBox />
                    </Stack>
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
                      {t("message_box_no_conversations")}
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
