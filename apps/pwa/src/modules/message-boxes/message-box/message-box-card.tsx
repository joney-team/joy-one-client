"use client";

import { Avatar } from "@/components/avatar";
import { TextOverflow } from "@/components/text-overflow";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { renderDateTime, renderTime, t } from "@/modules/lang/lang-service";
import {
  getMessages,
  messageBoxPlatformImages,
  messageBoxStatusColors,
} from "@/modules/message-boxes/message-boxes-service";
import {
  MessageAttachmentType,
  MessageBoxEntity,
  MessageBoxStatus,
} from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { forceDate } from "@/utils/dateTime.utils";
import { StringUtils } from "@/utils/string.utils";
import { useList } from "@/utils/use-list.util";
import { Badge, Card, Group, Image, Indicator, Stack, Text, Tooltip } from "@mantine/core";
import { IconUserSquareRounded } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC } from "react";
import { useMessageBoxes } from "../message-boxes-context";
interface CardMessageBoxProps {
  box: MessageBoxEntity;
}

export const CardMessageBox: FC<CardMessageBoxProps> = (props) => {
  const messageBoxes = useMessageBoxes();
  const { box } = props;
  const color = useColor();
  const plugins = usePlugins();
  const aiPlugin = plugins.aiAssistants[0];
  const plugin = plugins.getPlugin(box.platformId);

  const isAiAssistantEnabled = aiPlugin && aiPlugin.enabled && !box.aiAssistantDisabled;

  const newLatestMessage = useList({
    autoFetch: false,
    id: `newLatestMessage-${box._id}`,
    fetch: () =>
      getMessages({
        boxId: box._id,
        limit: 1,
      }),
  });

  useEventsListener([EventType.MESSAGE_NEW], (e) => {
    if (e.relatedEntities?.some((r) => r.id === box._id)) {
      newLatestMessage.fetch(true, { isSilient: true });
    }
  });

  const latestMessage = newLatestMessage.data[0] || box.latestMessage;

  const statusColor = color(messageBoxStatusColors[box.status || MessageBoxStatus.CLOSED]);

  return (
    <Card
      p={10}
      shadow="none"
      radius="md"
      withBorder
      className="clickable"
      onClick={() => messageBoxes.open(box)}
    >
      <Group w="100%" align="start" gap={12} wrap="nowrap">
        <Indicator
          label={
            <Tooltip label={plugin?.name} disabled={!plugin}>
              <Image src={messageBoxPlatformImages[box.platformType]} w={16} h={16} />
            </Tooltip>
          }
          radius={8}
          color="var(--mantine-color-body)"
          position="bottom-end"
          offset={5}
          styles={{
            indicator: {
              paddingInline: 0,
              width: 20,
              height: 20,
              transform: "translate(50%, 80%)",
              zIndex: 10,
            },
          }}
        >
          <Avatar
            messageBox={box}
            icon={IconUserSquareRounded}
            src={box.senderAvatar || box.customer?.avatar}
            size={42}
            radius={8}
          />
        </Indicator>

        <Stack gap={5} flex={1} mt={-3}>
          <Group justify="space-between" w="100%" wrap="nowrap">
            <TextOverflow fw={600} truncate="end" flex={1}>
              {props.box.senderName || props.box.customer?.name || t("guest")}
            </TextOverflow>

            {latestMessage && (
              <Text fz={12} c="gray">
                {(function () {
                  const isToday = dayjs(forceDate(latestMessage.createdAt)).isSame(dayjs(), "day");
                  if (isToday) return renderTime(latestMessage.createdAt);

                  return renderDateTime(latestMessage.createdAt);
                })()}
              </Text>
            )}
          </Group>

          <TextOverflow fz={12}>
            {(function () {
              if (!latestMessage) return null;
              if (latestMessage.text) return StringUtils.limitCharacters(latestMessage.text, 72);
              if (latestMessage.attachments?.[0]) {
                if (latestMessage.attachments[0].type === MessageAttachmentType.STICKER) {
                  return t("sent_sticker");
                }

                if (latestMessage.attachments[0].type === MessageAttachmentType.IMAGE) {
                  return t("sent_image");
                }

                return t("sent_file_length", { length: latestMessage.attachments.length });
              }
            })()}
          </TextOverflow>

          <Group mt={5} gap={5} justify="space-between" w="100%">
            <Badge size="xs" color={statusColor} variant="light">
              {t(`msg_boxes_status_${box.status}`)}
            </Badge>

            {isAiAssistantEnabled && (
              <Badge size="xs" color={color("violet.9")} variant="light">
                {t("ai-assistants")}
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
