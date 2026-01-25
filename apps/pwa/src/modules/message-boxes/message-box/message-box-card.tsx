"use client";

import { Avatar } from "@/components/avatar";
import { DateFormat } from "@/components/format/date-format";
import { useList } from "@/components/list/use-list";
import { TextOverflow } from "@/components/text-overflow";
import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import {
  getMessages,
  messageBoxPlatformImages,
} from "@/modules/message-boxes/message-boxes-service";
import {
  MessageAttachmentType,
  MessageBoxEntity,
  MessageBoxStatus,
} from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { String } from "@/utils/string.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Badge, Card, Group, Image, Indicator, Stack, Text, Tooltip } from "@mantine/core";
import { IconUserSquareRounded } from "@tabler/icons-react";
import { FC } from "react";
import { messageBoxStatuses } from "../message-boxes-contants";
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

  useEventsListener([EventType.MessageNew], (e) => {
    if (e.relatedEntities?.some((r) => r.id === box._id)) {
      newLatestMessage.fetch(true, { isSilient: true });
    }
  });

  const latestMessage = newLatestMessage.data[0] || box.latestMessage;
  const messageBoxStatus = messageBoxStatuses[box.status || MessageBoxStatus.CLOSED];

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
              {props.box.senderName || props.box.customer?.name || t`Guest`}
            </TextOverflow>

            {latestMessage && (
              <Text fz={12} c="gray">
                {(function () {
                  const isToday = DateTime.isSame(latestMessage.createdAt, new Date(), "day");
                  if (isToday) return <DateFormat value={latestMessage.createdAt} type="time" />;
                  return <DateFormat value={latestMessage.createdAt} type="date-time" />;
                })()}
              </Text>
            )}
          </Group>

          <TextOverflow fz={12}>
            {(function () {
              if (!latestMessage) return null;
              if (latestMessage.text) return String.limitCharacters(latestMessage.text, 72);
              if (latestMessage.attachments?.[0]) {
                if (latestMessage.attachments[0].type === MessageAttachmentType.STICKER) {
                  return t`Sent sticker`;
                }

                if (latestMessage.attachments[0].type === MessageAttachmentType.IMAGE) {
                  return t`Sent image`;
                }

                return t`Sent ${latestMessage.attachments.length} attached files`;
              }
            })()}
          </TextOverflow>

          <Group mt={5} gap={5} justify="space-between" w="100%">
            <Badge size="xs" color={messageBoxStatus.color} variant="light">
              {messageBoxStatus.label()}
            </Badge>

            {isAiAssistantEnabled && (
              <Badge size="xs" color={color("violet.9")} variant="light">
                {t`AI assistants`}
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
