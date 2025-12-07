"use client";

import { Card, Group, MantineColor, Stack, Text } from "@mantine/core";
import { Icon, IconClockHour3, IconMaximize } from "@tabler/icons-react";
import { ReactNode, type FC } from "react";
import { TaskMenuAction, type TaskMenu } from "./task-menu-types";

import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { updateTaskPath } from "../../tasks-route-helpers";
import styles from "./task-menu.module.css";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { TaskStatusIcon } from "../../components/task-status-options";

const MenuItem: FC<{
  icon: Icon;
  label: ReactNode;
  onClick: () => void;
  iconColor?: MantineColor;
}> = ({ icon: Icon, iconColor, label, onClick }) => {
  const color = useColor();

  return (
    <Group
      className={styles.TaskMenuItem}
      gap={6}
      pr={12}
      pl={6}
      py={6}
      align="center"
      onClick={onClick}
    >
      <Icon size={16} color={color(iconColor ?? "gray")} />
      <Text component="div" fz={13}>
        {label}
      </Text>
    </Group>
  );
};

export const TaskMenuDropdown: FC<TaskMenu & { onClose: () => void }> = ({
  task,
  onClose,
  groupVariables,
  action,
}) => {
  const router = useRouter();
  const { updateTasks } = useUpdateTasks();
  const { statuses } = useTaskStatuses(task);

  if (action === TaskMenuAction.CHANGE_STATUS) {
    return (
      <Card p={0}>
        <Stack gap={0} p={3}>
          {statuses.map((status) => {
            return (
              <Group
                className={styles.TaskMenuItem}
                key={status.id}
                gap={6}
                pr={12}
                pl={6}
                py={6}
                align="center"
                onClick={() => {
                  onClose();
                  updateTasks({
                    _id: task._id,
                    status: status.id,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              >
                <TaskStatusIcon size={16} color={status.color} id={status.id} />
                <Text fz={13}>{status.name}</Text>
              </Group>
            );
          })}
        </Stack>
      </Card>
    );
  }

  return (
    <Card p={0}>
      <Stack gap={0} p={3}>
        <MenuItem
          icon={IconMaximize}
          label={<Trans>View detail</Trans>}
          onClick={() => {
            router.push(updateTaskPath(location.pathname, { code: task.code }));
            onClose();
          }}
        />

        <MenuItem
          icon={IconClockHour3}
          label={<Trans>Clear time</Trans>}
          onClick={() => {
            onClose();
            updateTasks({
              _id: task._id,
              startDate: null,
              dueDate: null,
              context: { fromGroupVariables: groupVariables },
            });
          }}
        />
      </Stack>
    </Card>
  );
};
