"use client";

import { TaskPriority } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import { Card, Group, Stack, Text } from "@mantine/core";
import { taskPriorities } from "../../task-constants";
import { TaskMenuComponent } from "./task-menu-types";

import { IconFlagFilled, IconFlagOff } from "@tabler/icons-react";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import styles from "./task-menu.module.css";
import { Trans } from "@lingui/react/macro";

export const TaskMenuPriority: TaskMenuComponent = ({ task, onClose, groupVariables }) => {
  const color = useColor();
  const { updateTasks } = useUpdateTasks();

  return (
    <Card p={0} shadow="md" withBorder>
      <Stack gap={3} py={6} px={4}>
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
                onClose();
                await updateTasks({
                  _id: task._id,
                  priority: priority as TaskPriority,
                  context: { fromGroupVariables: groupVariables },
                });
              }}
            >
              <IconFlagFilled size={16} color={color(priorityConstant.color)} />
              <Text fz={14}>{priorityConstant.label()}</Text>
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
            onClose();
            await updateTasks({
              _id: task._id,
              priority: null,
              context: { fromGroupVariables: groupVariables },
            });
          }}
        >
          <IconFlagOff size={16} color={color("gray.4")} />
          <Text fz={14}>
            <Trans>No priority</Trans>
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};
