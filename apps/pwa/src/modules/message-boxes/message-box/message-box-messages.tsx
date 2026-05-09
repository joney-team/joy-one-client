"use client";

import { Avatar } from "@/components/avatar";
import { DateFormat } from "@/components/format/date-format";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { Renderer } from "@/components/renderer";
import {
  EventType,
  FileType,
  MessageResource,
  MessageStatus,
  MessageType,
} from "@/graphql/enums.graphql";
import { eventsEmitter, useEventsListener } from "@/modules/events/event-service";
import { FileCard } from "@/modules/files/file-card";
import { parseFile } from "@/modules/files/files-utils";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { ModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { String } from "@/utils/string.utils";
import { DateTime } from "@joy-one/utils/date-time";
import { requestAnimationFrameTimes } from "@joy-one/utils/request-animation-frame";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  em,
  Group,
  rgba,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Space,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconAnalyze, IconUserFilled, IconX } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useMemo, useRef } from "react";
import { MessageFragment } from "../graphql/fragmentMessage.graphql";
import { MessageBoxFragment } from "../graphql/fragmentMessageBox.graphql";
import GetMessagesDocument from "../graphql/getMessages.graphql";

export const MessageBoxMessages: FC<{
  box: MessageBoxFragment;
  height: number;
}> = (props) => {
  const { t } = useLingui();
  const color = useColor();
  const colorScheme = useColorScheme();
  const messageRef = useRef<HTMLDivElement>(null);

  const params = useMemo(() => {
    return {
      boxId: props.box._id,
      all: true,
    };
  }, [props.box._id]);

  const messages = useGraphqlList<MessageFragment>({
    query: GetMessagesDocument,
    params,
    events: [EventType.MessageNew, EventType.MessageUpdated],
  });

  const scrollToBottom = (behavior: ScrollBehavior = "smooth", delay = 0) => {
    setTimeout(() => {
      messageRef.current?.scrollTo({
        top: messageRef.current.scrollHeight,
        behavior,
      });
    }, delay);
  };

  useEffect(() => {
    const listner = (e: { type: string; args?: any }) => {
      if (e.type === "scrollToBottom") scrollToBottom(...e.args);
    };

    eventsEmitter.addListener("message-box", listner);

    return () => {
      eventsEmitter.removeListener("message-box", listner);
    };
  }, []);

  useEffect(() => {
    if (messages.isInitialized) {
      requestAnimationFrameTimes(() => {
        scrollToBottom("instant");
      });
    }
  }, [messages.isInitialized]);

  useEventsListener(
    [EventType.MessageNew, EventType.MessageUpdated],
    (msgEvent) => {
      if (msgEvent.data && msgEvent.data.boxId === props.box._id) {
        const isAtBottom =
          messageRef.current &&
          messageRef.current.scrollHeight - messageRef.current.scrollTop <=
            messageRef.current.clientHeight + 100;

        messages.fetch().then(() => {
          if (!isAtBottom) return;
          scrollToBottom("smooth", 200);
        });
      }
    },
    [props.box._id],
  );

  const messagesList = [...messages.data].reverse();

  const [userMemberInfos] = useWorkspaceMembers([
    ...new Set(messagesList.map((m) => m.userId || "").filter(Boolean)),
  ]);

  if (props.height === 0) return null;

  return (
    <ScrollArea
      className="MessagesArea"
      w="100%"
      h={props.height}
      viewportRef={messageRef}
      style={{ pointerEvents: "all" }}
    >
      <Stack p={10} px={16} justify="flex-end" w="100%" gap={5} mih={props.height}>
        {!messages.isInitialized && <Skeleton h={150} />}

        {messagesList.map((msg, index) => {
          const bgColor =
            msg.type === MessageType.Receive
              ? "var(--mantine-color-body)"
              : colorScheme === "dark"
                ? rgba(color("primary"), 0.2)
                : color("primary.0");

          const prevMsg = messagesList[index - 1];
          const nextMsg = messagesList[index + 1];
          const senderMember = userMemberInfos.find((m) => m.userId === msg.userId);
          const timeBtw =
            prevMsg && msg.createdAt && prevMsg.createdAt
              ? DateTime.diff(msg.createdAt, prevMsg.createdAt, "minute")
              : 0;
          const limitTimeBtw = 30;

          const needToShowDivider =
            timeBtw > limitTimeBtw || (prevMsg && prevMsg?.userId !== msg.userId);

          const isFirstSession = prevMsg?.type !== msg.type || needToShowDivider;
          const isLastSession = nextMsg?.type !== msg.type || !nextMsg;
          const isOnlyOneMessageSession = isFirstSession && isLastSession;
          const needToShowClientAvatar = isFirstSession && prevMsg?.type !== msg.type;

          const radius = "12px";
          const cornorRadius = "3px";

          const getBorderRadius = () => {
            if (msg.type === MessageType.Send) {
              if (isOnlyOneMessageSession) return `${radius} ${cornorRadius} ${radius} ${radius}`;
              if (isFirstSession) return `${radius} ${radius} ${cornorRadius} ${radius}`;
              if (isLastSession) return `${radius} ${cornorRadius} ${radius} ${radius}`;
              return `${radius} ${cornorRadius} ${cornorRadius} ${radius}`;
            }

            if (isOnlyOneMessageSession) return `${cornorRadius} ${radius} ${radius} ${radius}`;
            if (isFirstSession) return `${radius} ${radius} ${radius} ${cornorRadius}`;
            if (isLastSession) return `${cornorRadius} ${radius} ${radius} ${radius}`;
            return `${cornorRadius} ${radius} ${radius} ${cornorRadius}`;
          };

          const getTime = () => {
            if (!msg.createdAt) return "";

            // Today
            if (DateTime.isSame(msg.createdAt, new Date(), "day")) {
              return <DateFormat value={msg.createdAt} type="time" />;
            }

            // Yesterday
            if (DateTime.isSame(msg.createdAt, DateTime.subtract(new Date(), "day", 1), "day")) {
              return (
                <Fragment>
                  <Trans>Yesterday</Trans>
                  <DateFormat value={msg.createdAt} type="time" />
                </Fragment>
              );
            }

            // Other days
            return <DateFormat value={msg.createdAt} type="date-time" />;
          };

          return (
            <Fragment key={msg._id}>
              <Renderer visible={prevMsg && prevMsg.type !== msg.type}>
                <Space h={10} w={10} />
              </Renderer>

              <Group
                gap={8}
                wrap="nowrap"
                align="start"
                justify={msg.type === MessageType.Receive ? "start" : "end"}
              >
                <Renderer visible={msg.type === MessageType.Receive}>
                  <Avatar
                    messageBox={props.box}
                    customer={props.box.customer}
                    icon={IconUserFilled}
                    opacity={needToShowClientAvatar ? 1 : 0}
                    radius={msg.type === MessageType.Receive ? 5 : undefined}
                  />
                </Renderer>

                <Stack
                  maw="100%"
                  gap={3}
                  key={msg._id}
                  justify={msg.type === MessageType.Receive ? "flex-start" : "flex-end"}
                  align={msg.type === MessageType.Receive ? "flex-start" : "flex-end"}
                >
                  <Renderer visible={msg.type === MessageType.Receive}>
                    <Renderer visible={isFirstSession}>
                      <Text fz={12} c="gray.6">
                        • {getTime()}
                      </Text>
                    </Renderer>

                    <Renderer visible={!isFirstSession && needToShowDivider}>
                      <Text fz={12} c="gray.6">
                        {t`${timeBtw} minutes ago`}
                      </Text>
                    </Renderer>
                  </Renderer>

                  <Renderer visible={msg.type === MessageType.Send}>
                    <Renderer visible={isFirstSession || needToShowDivider}>
                      <ModalUserInformation>
                        {(modal) => (
                          <Group gap={3}>
                            <Anchor
                              fz={12}
                              c="gray.6"
                              ta="right"
                              onClick={() => {
                                if (!senderMember?.userId) return;
                                modal.open(senderMember?.userId || "");
                              }}
                            >
                              {msg.resource === MessageResource.AiAssistant
                                ? t`AI assistant`
                                : senderMember?.name || ""}
                            </Anchor>

                            <Text fz={12} c="gray.6" ta="right">
                              • {getTime()}
                            </Text>
                          </Group>
                        )}
                      </ModalUserInformation>
                    </Renderer>
                  </Renderer>

                  <Renderer visible={!!msg.text || (msg.attachments || []).length > 0}>
                    <Card
                      id={`message-${msg._id}`}
                      withBorder
                      shadow="none"
                      py={8}
                      px={10}
                      bg={bgColor}
                      radius={0}
                      style={{
                        borderRadius: getBorderRadius(),
                      }}
                    >
                      <Stack
                        gap={8}
                        align={msg.type === MessageType.Receive ? "flex-start" : "flex-end"}
                      >
                        <Renderer visible={!!msg.text}>
                          <Text
                            style={{ wordBreak: "break-word" }}
                            dangerouslySetInnerHTML={{
                              __html: String.replaceLineBreaksToHTML(msg.text || ""),
                            }}
                          />
                        </Renderer>

                        <Renderer visible={(msg.attachments || []).length > 0}>
                          <SimpleGrid
                            cols={(msg.attachments || []).length === 1 ? 1 : 2}
                            spacing={8}
                          >
                            {(msg.attachments || []).map((att, i) => {
                              const file = parseFile(att.url || "");
                              if (!att.url) return null;

                              return (
                                <FileCard
                                  src={att.url}
                                  key={`${msg._id}-${i}-file`}
                                  type={file.type === FileType.Photo ? "preview" : undefined}
                                  viewable
                                  thumbnail={{
                                    mih: 100,
                                    mah: 100,
                                  }}
                                />
                              );
                            })}
                          </SimpleGrid>
                        </Renderer>
                      </Stack>
                    </Card>

                    {(function () {
                      if (msg.status === MessageStatus.SentFailed) {
                        return (
                          <Group gap={10} h={20}>
                            <Group justify="center" gap={0}>
                              <ThemeIcon variant="transparent" size="xs" color="red">
                                <IconX size={12} />
                              </ThemeIcon>

                              <Text c="red" fz={em(10)} ta="center">
                                {t`Send message failed`}
                              </Text>
                            </Group>
                          </Group>
                        );
                      }

                      if (msg.status === MessageStatus.Pending) {
                        return (
                          <Group justify="center" gap={0}>
                            <ThemeIcon variant="transparent" size="xs" color="gray">
                              <IconAnalyze
                                size={12}
                                style={{ animation: `symbolLoader 2s linear infinite` }}
                              />
                            </ThemeIcon>

                            <Text fz={em(10)} ta="center" c="gray">
                              {t`Message sending`}
                            </Text>
                          </Group>
                        );
                      }
                    })()}
                  </Renderer>
                </Stack>
              </Group>
            </Fragment>
          );
        })}
      </Stack>
    </ScrollArea>
  );
};
