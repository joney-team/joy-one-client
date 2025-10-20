"use client";

import { Avatar } from "@/components/avatar";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { eventsEmitter, useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { FileCard } from "@/modules/files/file-card";
import { FileType } from "@/modules/files/file-types";
import { parseFile } from "@/modules/files/files-utils";
import { getDateFormat, getTimeFormat, renderTime, t } from "@/modules/lang/lang-service";
import { getMessages } from "@/modules/message-boxes/message-boxes-service";
import {
  MessageBoxEntity,
  MessageResource,
  MessageStatus,
  MessageType,
} from "@/modules/message-boxes/message-boxes-types";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { OnModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { String } from "@/utils/string.utils";
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
import dayjs from "dayjs";
import { FC, Fragment, useEffect, useRef } from "react";

export const MessageBoxMessages: FC<{ box: MessageBoxEntity; height: number }> = (props) => {
  const color = useColor();
  const colorScheme = useColorScheme();
  const messageRef = useRef<HTMLDivElement>(null);

  const messages = useList({
    autoFetch: false,
    fetch: (q) =>
      getMessages({
        ...q,
        boxId: props.box._id,
        getAll: true,
      }),
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
    messages.setStatus({ isInitialized: false });
    messages.fetch(true, { isSilient: true }).then(() => scrollToBottom("instant"));
  }, [props.box._id]);

  useEffect(() => {
    const listner = (e: { type: string; args?: any }) => {
      if (e.type === "scrollToBottom") scrollToBottom(...e.args);
    };

    eventsEmitter.addListener("message-box", listner);

    return () => {
      eventsEmitter.removeListener("message-box", listner);
    };
  }, []);

  useEventsListener(
    [EventType.MESSAGE_NEW, EventType.MESSAGE_UPDATED],
    (msgEvent) => {
      if (msgEvent.data && msgEvent.data.boxId === props.box._id) {
        const isAtBottom =
          messageRef.current &&
          messageRef.current.scrollHeight - messageRef.current.scrollTop <=
            messageRef.current.clientHeight + 100;

        messages.fetch(true, { isSilient: true }).then(() => {
          if (!isAtBottom) return;
          scrollToBottom("smooth", 200);
        });
      }
    },
    [props.box._id]
  );

  useEffect(() => {
    if (messages.isAbleToLoadMore) {
      const handler = () => {
        if (messageRef.current && messageRef.current.scrollTop <= 100) {
          messageRef.current?.removeEventListener("scroll", handler);
          messages.fetch(false, { isSilient: true });
        }
      };

      messageRef.current?.addEventListener("scroll", handler);
      return () => {
        messageRef.current?.removeEventListener("scroll", handler);
      };
    }
  }, [messages.isAbleToLoadMore]);

  const messagesList = [...messages.data].reverse();

  const [userMemberInfos] = useWorkspaceMembers([
    ...new Set(messagesList.map((m) => m.userId || "").filter(Boolean)),
  ]);

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
            msg.type === MessageType.RECEIVE
              ? "var(--mantine-color-body)"
              : colorScheme === "dark"
              ? rgba(color("primary"), 0.2)
              : color("primary.0");

          const prevMsg = messagesList[index - 1];
          const nextMsg = messagesList[index + 1];
          const senderMember = userMemberInfos.find((m) => m.userId === msg.userId);
          const timeBtw = prevMsg
            ? dayjs(msg.createdAt * 1000).diff(dayjs(prevMsg.createdAt * 1000), "minutes")
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
            if (msg.type === MessageType.SEND) {
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
            const isToday = dayjs(msg.createdAt * 1000).isSame(dayjs(), "day");
            const isYesterday = dayjs(msg.createdAt * 1000).isSame(
              dayjs().subtract(1, "day"),
              "day"
            );
            const isSameWeek = dayjs(msg.createdAt * 1000).isSame(dayjs(), "week");

            if (isToday) return renderTime(msg.createdAt);
            if (isYesterday) return `${t("yesterday")} ${renderTime(msg.createdAt)}`;
            if (isSameWeek) return dayjs(msg.createdAt * 1000).format("dddd HH:mm");
            return dayjs(msg.createdAt * 1000).format(`MMM ${getDateFormat()} ${getTimeFormat()}`);
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
                justify={msg.type === MessageType.RECEIVE ? "start" : "end"}
              >
                <Renderer visible={msg.type === MessageType.RECEIVE}>
                  <Avatar
                    messageBox={props.box}
                    customer={props.box.customer}
                    icon={IconUserFilled}
                    opacity={needToShowClientAvatar ? 1 : 0}
                    radius={msg.type === MessageType.RECEIVE ? 5 : undefined}
                  />
                </Renderer>

                <Stack
                  maw="100%"
                  gap={3}
                  key={msg._id}
                  justify={msg.type === MessageType.RECEIVE ? "flex-start" : "flex-end"}
                  align={msg.type === MessageType.RECEIVE ? "flex-start" : "flex-end"}
                >
                  <Renderer visible={msg.type === MessageType.RECEIVE}>
                    <Renderer visible={isFirstSession}>
                      <Text fz={12} c="gray.6">
                        • {getTime()}
                      </Text>
                    </Renderer>

                    <Renderer visible={!isFirstSession && needToShowDivider}>
                      <Text fz={12} c="gray.6">
                        {t("minutes_ago", { minutes: timeBtw })}
                      </Text>
                    </Renderer>
                  </Renderer>

                  <Renderer visible={msg.type === MessageType.SEND}>
                    <Renderer visible={isFirstSession || needToShowDivider}>
                      <Group gap={3}>
                        <Anchor
                          fz={12}
                          c="gray.6"
                          ta="right"
                          onClick={() => {
                            if (!senderMember?.userId) return;
                            OnModalUserInformation(senderMember?.userId || "");
                          }}
                        >
                          {msg.resource === MessageResource.AI_ASSISTANT
                            ? t("ai_assistant")
                            : senderMember?.name || ""}
                        </Anchor>

                        <Text fz={12} c="gray.6" ta="right">
                          • {getTime()}
                        </Text>
                      </Group>
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
                        align={msg.type === MessageType.RECEIVE ? "flex-start" : "flex-end"}
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
                                  type={file.type === FileType.PHOTO ? "preview" : undefined}
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
                      if (msg.status === MessageStatus.SENT_FAILED) {
                        return (
                          <Group gap={10} h={20}>
                            <Group justify="center" gap={0}>
                              <ThemeIcon variant="transparent" size="xs" color="red">
                                <IconX size={12} />
                              </ThemeIcon>

                              <Text c="red" fz={em(10)} ta="center">
                                {t("send_msg_failed")}
                              </Text>
                            </Group>
                          </Group>
                        );
                      }

                      if (msg.status === MessageStatus.PENDING) {
                        return (
                          <Group justify="center" gap={0}>
                            <ThemeIcon variant="transparent" size="xs" color="gray">
                              <IconAnalyze
                                size={12}
                                style={{ animation: `symbolLoader 2s linear infinite` }}
                              />
                            </ThemeIcon>

                            <Text fz={em(10)} ta="center" c="gray">
                              {t("msg_sending")}
                            </Text>
                          </Group>
                        );
                      }
                    })()}

                    {/* <Renderer visible={ENV === 'development'}>
                    {msg.id && <Text fz={em(10)} ta="center" c="gray">#{msg.id}</Text>}
                    {msg.resource && <Text fz={em(10)} ta="center" c="gray">{msg.resource}</Text>}
                  </Renderer> */}
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
