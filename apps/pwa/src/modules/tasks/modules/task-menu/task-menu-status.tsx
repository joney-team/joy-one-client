"use client";

import { Card, Divider, Group, Stack, Text } from "@mantine/core";
import { Fragment } from "react";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { TaskMenuComponent } from "./task-menu-types";

import { TaskStatusIcon } from "../../components/task-status-options";
import { DefaultTaskStatusId } from "../../tasks-types";
import styles from "./task-menu.module.css";

export const TaskMenuStatus: TaskMenuComponent = ({ task, onClose, groupVariables }) => {
  const { updateTasks } = useUpdateTasks();
  const { statuses } = useTaskStatuses(task);

  return (
    <Card p={0} shadow="md" withBorder>
      <Stack gap={3} py={4}>
        {statuses.map((status) => {
          return (
            <Fragment key={status.id}>
              {status.id === DefaultTaskStatusId.CLOSED && (
                <Divider my={2} miw="100%" opacity={0.3} />
              )}

              <Stack px={4}>
                <Group
                  className={styles.TaskMenuItem}
                  gap={6}
                  pr={16}
                  pl={8}
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
                  <Text tt="uppercase" fz={13}>
                    {status.name}
                  </Text>
                </Group>
              </Stack>

              {status.id === DefaultTaskStatusId.TODO && (
                <Divider my={2} miw="100%" opacity={0.3} />
              )}
            </Fragment>
          );
        })}
      </Stack>
    </Card>
  );
};
