"use client";

import { Avatar } from "@/components/avatar";
import { ModalTitle } from "@/components/modal-title";
import { useRouter } from "@/hooks/use-router";
import {
  closeMesssageBox,
  messageBoxPlatformImages,
  messageBoxStatusColors,
  removeMessageBox,
  setAssigneeToMessageBox,
  toggleMessageBoxAiAssistant,
} from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxStatus } from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { onActionLoad, onArchive } from "@/utils/actions";
import { t } from "@lingui/core/macro";
import { ActionIcon, Badge, Group, Image, Stack, Text, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconCheck,
  IconCircleCheck,
  IconRobot,
  IconTrash,
  IconUser,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { FC } from "react";
import { messageBoxStatuses } from "../message-boxes-contants";
import { useMessageBoxes } from "../message-boxes-context";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { Trans } from "@lingui/react/macro";

export const MessageBoxHead: FC = () => {
  const messageBoxes = useMessageBoxes();
  const box = messageBoxes.messageBox;
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
      onConfirm: () => closeMesssageBox(box._id),
    });
  };

  const onRemove = async () => {
    if (!box) return;

    onArchive({
      name: <Trans>Message boxes</Trans>,
      process: async () => {
        await removeMessageBox(box._id);
        router.replace("/message-boxes");
      },
    });
  };

  if (!box) return null;

  return (
    <Group className="bg-content" py={8} px={12} w="100%">
      <Group flex={1} gap={10}>
        <Avatar
          radius={8}
          icon={IconUserSquareRounded}
          src={box?.senderAvatar || box?.customer?.avatar}
          size={40}
        />

        <Stack gap={3}>
          <Title fz={18}>{box?.senderName || box?.customer?.name || t`Guest`}</Title>

          {plugin && (
            <Group gap={4}>
              <Image src={messageBoxPlatformImages[box.platformType]} w={16} h={16} />
              <Text fz={14} c="dimmed">
                {plugin.name}
              </Text>
            </Group>
          )}
        </Stack>
      </Group>

      <Group gap={8}>
        <Tooltip label={t`Assignee`}>
          <Group>
            <WorkspaceMemberInput
              value={box.assigneeUser}
              onChange={(u) => {
                onActionLoad({
                  name: t`Assign assignee`,
                  icon: IconUser,
                  process: async () => {
                    return setAssigneeToMessageBox(box._id, u?.userId);
                  },
                });
              }}
            />
          </Group>
        </Tooltip>

        {(function () {
          if (!box.status) return null;

          if (box.status === MessageBoxStatus.IN_PROGRESS)
            return (
              <Tooltip label={t`Message box closed`}>
                <ActionIcon color="green" onClick={onMarkAsDone}>
                  <IconCheck size={20} />
                </ActionIcon>
              </Tooltip>
            );

          const statusColor = messageBoxStatusColors[box.status];

          return <Badge color={color(statusColor)}>{messageBoxStatuses[box.status].label()}</Badge>;
        })()}

        <Tooltip label={`${isAiAssistantEnabled ? t`Disable` : t`Enable`} ${t`AI assistants`}`}>
          <ActionIcon
            variant={isAiAssistantEnabled ? "filled" : "outline"}
            color="violet.9"
            onClick={() => {
              if (aiPlugin) toggleMessageBoxAiAssistant(box._id, !box.aiAssistantDisabled);
              else router.push("/workspace-settings/messages");
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
