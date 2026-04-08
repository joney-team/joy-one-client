"use client";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { MessageBoxStatus } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { useRouter } from "@/hooks/use-router";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { onActionLoad, onArchive } from "@/utils/actions";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, Image, Stack, Text, Title, Tooltip } from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconRobot,
  IconTrash,
  IconUser,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { FC } from "react";
import AssignUserToMessageBoxDocument from "../graphql/assignUserToMessageBox.graphql";
import CloseMessageBoxDocument from "../graphql/closeMessageBox.graphql";
import DeleteMessageBoxDocument from "../graphql/deleteMessageBox.graphql";
import { MessageBoxFragment } from "../graphql/fragmentMessageBox.graphql";
import SwitchMessageBoxAiAssistantDocument from "../graphql/switchMessageBoxAiAssistant.graphql";
import { messageBoxPlatforms, messageBoxStatuses } from "../message-boxes-contants";

export const MessageBoxHead: FC<{ box: MessageBoxFragment }> = ({ box }) => {
  const { t } = useLingui();
  const client = useApolloClient();
  const router = useRouter();
  const color = useColor();
  const plugins = usePlugins();
  const plugin = plugins.getPlugin(box?.platformId);

  const aiPlugin = plugins.aiAssistants[0];
  const isAiAssistantEnabled = box && aiPlugin && aiPlugin.enabled && !box.aiAssistantDisabled;

  const onMarkAsDone = async () => {
    if (!box) return;

    onConfirmModal({
      type: "success",
      icon: IconCircleCheck,
      content: <Trans>Are you sure you want to mark as done?</Trans>,
      onConfirm: () =>
        client.mutate({
          mutation: CloseMessageBoxDocument,
          variables: { boxId: box._id },
        }),
    });
  };

  const onRemove = async () => {
    if (!box) return;

    onArchive({
      name: <Trans>Message boxes</Trans>,
      process: async () => {
        await client.mutate({
          mutation: DeleteMessageBoxDocument,
          variables: { boxId: box._id },
        });
        router.replace("/message-boxes");
      },
    });
  };

  return (
    <Group
      className="bg-content"
      py={8}
      px="xs"
      w="100%"
      miw={0}
      style={{ borderBottom: `1px solid var(--app-divider-color)` }}
    >
      <Group flex={1} gap={10} miw={0}>
        <Avatar
          radius={8}
          icon={IconUserSquareRounded}
          src={box?.senderAvatar || box?.customer?.avatar}
          size={40}
        />

        <Stack gap={3} flex={1} miw={0}>
          <Text truncate fw={500} flex={1} miw={0}>
            {box?.senderName || box?.customer?.name || <Trans>Guest</Trans>}
          </Text>

          {plugin && (
            <Group gap={4}>
              <Image src={messageBoxPlatforms[box.platformType].image} w={16} h={16} />
              <Text fz={14} c="dimmed">
                {plugin.name}
              </Text>
            </Group>
          )}
        </Stack>
      </Group>

      <Group gap={8}>
        <Tooltip label={<Trans>Assignee</Trans>}>
          <Group>
            <WorkspaceMemberInput
              value={box.assigneeUser}
              onChange={(u) => {
                onActionLoad({
                  name: <Trans>Assign assignee</Trans>,
                  icon: IconUser,
                  process: async () => {
                    return client.mutate({
                      mutation: AssignUserToMessageBoxDocument,
                      variables: { boxId: box._id, userId: u?.userId },
                    });
                  },
                });
              }}
            />
          </Group>
        </Tooltip>

        {(function () {
          if (!box.status) return null;

          if (box.status === MessageBoxStatus.InProgress)
            return (
              <Tooltip label={<Trans>Message box closed</Trans>}>
                <ActionIcon color="green" onClick={onMarkAsDone}>
                  <IconCheck size={20} />
                </ActionIcon>
              </Tooltip>
            );

          const { color: statusColor } = messageBoxStatuses[box.status];

          return (
            <Badge color={color(statusColor)}>{t(messageBoxStatuses[box.status].label)}</Badge>
          );
        })()}

        <Tooltip
          label={
            isAiAssistantEnabled ? (
              <Trans>Disable AI assistants</Trans>
            ) : (
              <Trans>Enable AI assistants</Trans>
            )
          }
        >
          <ActionIcon
            variant={isAiAssistantEnabled ? "filled" : "outline"}
            color="violet.9"
            onClick={() => {
              if (aiPlugin) {
                client.mutate({
                  mutation: SwitchMessageBoxAiAssistantDocument,
                  variables: { boxId: box._id, disabled: !box.aiAssistantDisabled },
                });
              } else {
                router.push("/workspace-settings/messages");
              }
            }}
          >
            <IconRobot size={20} />
          </ActionIcon>
        </Tooltip>

        <ActionIcon variant="outline" color="gray" onClick={onRemove}>
          <IconTrash size={20} strokeWidth={1.5} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
