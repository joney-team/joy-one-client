"use client";

import type { TaskPriority } from "@/graphql/types.graphql";
import { useColor } from "@/modules/theme/use-color";
import { Group, Stack, Text } from "@mantine/core";
import { taskPriorities } from "../../tasks-constants";
import { TaskMenuComponent } from "./task-menu-types";

import { Trans, useLingui } from "@lingui/react/macro";
import { IconFlagFilled, IconFlagOff } from "@tabler/icons-react";
import styles from "./task-menu.module.css";

export const TaskMenuPriority: TaskMenuComponent = ({ task, groupVariables, updateTask }) => {
  const color = useColor();
  const { t } = useLingui();

  return (
    <Stack gap={3} py={5} px={5}>
      {Object.entries(taskPriorities).map(([priority, priorityConstant]) => {
        return (
          <Group
            key={priority}
            className={styles.TaskMenuItem}
            gap={6}
            pr={18}
            pl={8}
            py={6}
            align="center"
            onClick={async () => {
              await updateTask({
                _id: task._id,
                priority: priority as TaskPriority,
                context: { fromGroupVariables: groupVariables },
              });
            }}
          >
            <IconFlagFilled size={16} color={color(priorityConstant.color)} />
            <Text fz={14}>{t(priorityConstant.label)}</Text>
          </Group>
        );
      })}

      <Group
        className={styles.TaskMenuItem}
        gap={6}
        pr={18}
        pl={8}
        py={6}
        align="center"
        onClick={async () => {
          await updateTask({
            _id: task._id,
            priority: null,
            context: { fromGroupVariables: groupVariables },
          });
        }}
      >
        <IconFlagOff size={16} color={color("gray.4")} />
        <Text fz={14}>
          <Trans>Clear priority</Trans>
        </Text>
      </Group>
    </Stack>
  );
};
