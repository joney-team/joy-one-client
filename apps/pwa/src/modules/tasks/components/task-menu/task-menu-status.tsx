"use client";

import { Card, Divider, Group, Stack, Text } from "@mantine/core";
import { Fragment } from "react";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { TaskMenuComponent } from "./task-menu-types";

import { TaskStatusIcon } from "../task-status-icon";
import { TaskFragment } from "../../graphql/fragmentTask.graphql";
import { DefaultTaskStatusId } from "../../tasks-types";
import styles from "./task-menu.module.css";

export const TaskMenuStatus: TaskMenuComponent = ({
  task,
  onClose,
  groupVariables,
  updateTask,
}) => {
  const { statuses } = useTaskStatuses({
    status: task.status ?? DefaultTaskStatusId.TODO,
    statuses: task.statuses ?? [],
  } as Pick<TaskFragment, "status" | "statuses">);

  return (
    <Stack gap={3} py={4}>
      {statuses.map((status, statusIndex) => {
        return (
          <Fragment key={status.id + statusIndex}>
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
                  updateTask({
                    _id: task._id,
                    status: status.id,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              >
                <TaskStatusIcon {...status} />
                <Text tt="uppercase" fz={13}>
                  {status.name}
                </Text>
              </Group>
            </Stack>
          </Fragment>
        );
      })}
    </Stack>
  );
};
