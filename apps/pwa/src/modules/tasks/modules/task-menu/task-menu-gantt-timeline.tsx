"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group, MantineColor, Stack, Text } from "@mantine/core";
import {
  Icon,
  IconClockHour3,
  IconMaximize,
  IconNavigation,
  IconNavigationFilled,
  IconSwipeDown,
  IconSwipeDownFilled,
  ReactNode,
} from "@tabler/icons-react";
import { FC } from "react";
import { TaskMenuComponent } from "./task-menu-types";

import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { updateTaskPath } from "../../tasks-route-helpers";
import styles from "./task-menu.module.css";

const MenuItem: FC<{
  icon: Icon;
  label: ReactNode;
  onClick: () => void;
  iconColor?: MantineColor;
  disabled?: boolean;
}> = ({ icon: Icon, iconColor, label, onClick, disabled = false }) => {
  const color = useColor();

  return (
    <Group
      className={styles.TaskMenuItem}
      gap={6}
      pr={12}
      pl={6}
      py={6}
      align="center"
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
    >
      <Icon size={16} color={color(iconColor ?? "gray")} />
      <Text component="div" fz={13}>
        {label}
      </Text>
    </Group>
  );
};

export const TaskMenuGanttTimeline: TaskMenuComponent = ({
  task,
  onClose,
  groupVariables,
  updateTask,
  scrollToDate,
}) => {
  const router = useRouter();

  return (
    <Stack gap={0} p={5}>
      <MenuItem
        icon={IconMaximize}
        label={<Trans>View detail</Trans>}
        onClick={() => {
          router.push(updateTaskPath({ code: task.code }));
          onClose();
        }}
      />

      <MenuItem
        icon={IconSwipeDown}
        label={<Trans>Scroll to start date</Trans>}
        disabled={!task.startDate}
        onClick={() => {
          if (!task.startDate) return;
          scrollToDate?.(task.startDate);
          onClose();
        }}
      />

      <MenuItem
        icon={IconSwipeDownFilled}
        label={<Trans>Scroll to finish date</Trans>}
        disabled={!task.dueDate}
        onClick={() => {
          if (!task.dueDate) return;
          scrollToDate?.(task.dueDate);
          onClose();
        }}
      />

      <MenuItem
        icon={IconClockHour3}
        label={<Trans>Clear time</Trans>}
        onClick={() => {
          onClose();
          updateTask({
            _id: task._id,
            startDate: null,
            dueDate: null,
            context: { fromGroupVariables: groupVariables },
          });
        }}
      />
    </Stack>
  );
};
