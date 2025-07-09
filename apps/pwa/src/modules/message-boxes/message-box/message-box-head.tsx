"use client";

import { useColor } from "@/modules/theme/use-color";
import { useRouter } from "@/hooks/use-router";
import { Avatar } from "@/components/avatar";
import { t } from "@/modules/lang/lang-service";
import {
  closeMesssageBox,
  messageBoxStatusColors,
  removeMessageBox,
  setAssigneeToMessageBox,
  toggleMessageBoxAiAssistant,
} from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxStatus } from "@/modules/message-boxes/message-boxes-types";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { onActionLoad, onArchive } from "@/utils/actions";
import { ActionIcon, Badge, Group, Stack, Text, Title, Tooltip } from "@mantine/core";
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
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { ModalTitle } from "@/components/modal-title";
import { useMessageBoxes } from "../message-boxes-context";

export const MessageBoxHead: FC = () => {
  const messageBoxes = useMessageBoxes();
  const box = messageBoxes.messageBox;
  const router = useRouter();
  const color = useColor();
  const plugins = usePlugins();
  const aiPlugin = plugins.aiAssistants[0];
  const isAiAssistantEnabled = box && aiPlugin && aiPlugin.enabled && !box.aiAssistantDisabled;

  const onClose = async () => {
    modals.openConfirmModal({
      title: <ModalTitle title={t("confirm")} icon={IconCircleCheck} />,
      children: t("message_box_closed_confirm"),
      onConfirm: async () => {
        if (!box) return;
        return closeMesssageBox(box._id);
      },
      labels: {
        cancel: t("cancel"),
        confirm: t("confirm"),
      },
    });
  };

  const onRemove = async () => {
    onArchive({
      name: t("message_boxes"),
      process: async () => {
        if (!box) return;
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
          <Title fz={18}>{box?.senderName || box?.customer?.name}</Title>

          <Text fz={14} c="dimmed">
            #{box.senderId}
          </Text>
        </Stack>
      </Group>

      <Group gap={8}>
        <Tooltip label={t("assignee")}>
          <Group>
            <WorkspaceMemberInput
              value={box.assigneeUser}
              onChange={(u) => {
                onActionLoad({
                  name: t("assign_assignee"),
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
              <Tooltip label={t("message_box_closed")}>
                <ActionIcon color="green" onClick={onClose}>
                  <IconCheck size={20} />
                </ActionIcon>
              </Tooltip>
            );

          const statusColor = messageBoxStatusColors[box.status];

          return <Badge color={color(statusColor)}>{t(`msg_boxes_status_${box.status}`)}</Badge>;
        })()}

        <Tooltip label={`${t(isAiAssistantEnabled ? "disable" : "enable")} ${t("ai-assistants")}`}>
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
