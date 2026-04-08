"use client";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { DateFormat } from "@/components/format/date-format";
import { MessageAttachmentType, MessageBoxStatus } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { String } from "@/utils/string.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Card, Group, Image, Indicator, Stack, Text, Tooltip } from "@mantine/core";
import { IconUserSquareRounded } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { MessageBoxFragment } from "../graphql/fragmentMessageBox.graphql";
import { messageBoxPlatforms, messageBoxStatuses } from "../message-boxes-contants";

interface CardMessageBoxProps {
  box: MessageBoxFragment;
}

export const CardMessageBox: FC<CardMessageBoxProps> = (props) => {
  const { box } = props;
  const { t } = useLingui();
  const router = useRouter();
  const layout = useLayout();

  const plugins = usePlugins();
  const aiPlugin = plugins.aiAssistants[0];
  const plugin = plugins.getPlugin(box.platformId);

  const isAiAssistantEnabled = aiPlugin && aiPlugin.enabled && !box.aiAssistantDisabled;

  const latestMessage = box.lastMessage;
  const messageBoxStatus = messageBoxStatuses[box.status || MessageBoxStatus.Closed];

  return (
    <Card
      p={10}
      shadow="none"
      radius="md"
      withBorder
      className="clickable"
      onClick={() => {
        if (layout.view === "mobile") {
          router.push(`/message-boxes/${box._id}`);
        } else {
          router.replace(`/message-boxes/${box._id}`);
        }
      }}
      w="100%"
      miw={0}
    >
      <Group miw={0} w="100%" align="start" gap={12} wrap="nowrap">
        <Indicator
          label={
            <Tooltip label={plugin?.name} disabled={!plugin}>
              <Image src={messageBoxPlatforms[box.platformType].image} w={16} h={16} />
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
              zIndex: 2,
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

        <Stack gap={5} flex={1} mt={-3} miw={0}>
          <Group justify="space-between" w="100%" wrap="nowrap">
            <Text fw={600} truncate="end" flex={1}>
              {props.box.senderName || props.box.customer?.name || <Trans>Guest</Trans>}
            </Text>

            {latestMessage && latestMessage.createdAt && (
              <Text fz="xs" c="gray">
                {(function () {
                  const isToday = DateTime.isSame(latestMessage.createdAt, new Date(), "day");
                  if (isToday) return <DateFormat value={latestMessage.createdAt} type="time" />;
                  return <DateFormat value={latestMessage.createdAt} type="date-time" />;
                })()}
              </Text>
            )}
          </Group>

          <Text fz="xs" truncate="end">
            {(function () {
              if (!latestMessage) return null;
              if (latestMessage.text) return String.limitCharacters(latestMessage.text, 72);
              if (latestMessage.attachments?.[0]) {
                if (latestMessage.attachments[0].type === MessageAttachmentType.Sticker) {
                  return <Trans>Sent sticker</Trans>;
                }

                if (latestMessage.attachments[0].type === MessageAttachmentType.Image) {
                  return <Trans>Sent image</Trans>;
                }

                return <Trans>Sent {latestMessage.attachments.length} attached files</Trans>;
              }
            })()}
          </Text>

          <Group mt={5} gap={5} justify="space-between" w="100%">
            <Badge size="xs" color={messageBoxStatus.color} variant="light">
              {t(messageBoxStatus.label)}
            </Badge>

            {isAiAssistantEnabled && (
              <Badge size="xs" color="violet" variant="light">
                <Trans>AI assistants</Trans>
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
