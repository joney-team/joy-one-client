"use client";

import { Card, Group, MantineColor, Stack, Text } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";
import { useColor } from "@/modules/theme/use-color";
import { Icon, IconClockHour3, IconMaximize, ReactNode } from "@tabler/icons-react";
import { FC } from "react";

import styles from "./task-menu.module.css";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { updateTaskPath } from "../../tasks-route-helpers";
import { useUpdateTasks } from "../../hooks/use-update-tasks";

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

export const TaskMenuGanttTimeline: TaskMenuComponent = ({ task, onClose, groupVariables }) => {
  const router = useRouter();
  const { updateTasks } = useUpdateTasks();

  return (
    <Card p={0} shadow="md">
      <Stack gap={0} p={5}>
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
