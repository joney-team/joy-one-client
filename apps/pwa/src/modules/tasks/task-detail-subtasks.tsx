"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { NumberFormat } from "@/components/format/number-format";
import { Trans } from "@lingui/react/macro";
import { Card, Divider, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconPlus, IconSubtask } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, type FC } from "react";
import { useTasksQuery } from "./hooks/use-tasks-query";
import { ModalCreateTask } from "./modals/modal-create-task";
import { TaskDataFragment } from "./graphql/fragmentTask.graphql";
import { type TasksQueryVariables } from "./graphql/queryTasks.graphql";
import { ListTaskRow } from "./views/list/list-task-row";
import { ListTaskRowHead } from "./views/list/list-task-row-head";
import { updateTaskPath } from "./tasks-route-helpers";

export const TaskDetailSubtasks: FC<{ task: TaskDataFragment }> = ({ task }) => {
  const pathname = usePathname();

  const groupVariables: TasksQueryVariables = useMemo(
    () => ({
      parentId: task._id,
      all: true,
    }),
    [task._id]
  );

  const {
    getTasks: getSubtasks,
    tasks: subTasks,
    loading,
    isHasData,
  } = useTasksQuery({
    variables: groupVariables,
    isSkipLoadCount: task.childCount === 0,
  });

  useEffect(() => {
    if (task.parentId) return;
    getSubtasks();
  }, [getSubtasks]);

  return (
    <Stack gap={5}>
      <Group justify="start">
        <Group gap={8}>
          <ThemeIcon variant="light" color="dark">
            <IconSubtask strokeWidth={1.5} size={20} />
          </ThemeIcon>

          <Text fw={500}>
            <Trans>Subtasks</Trans>
          </Text>
        </Group>

        <Group gap={5}>
          <Text fz={15}>
            <NumberFormat value={task.childProgress ?? 0} suffix="%" />
          </Text>
          <Progress value={task.childProgress ?? 0} w={70} color={"dark"} />
        </Group>

        <ModalCreateTask>
          {(open) => (
            <Button
              size="compact-xs"
              color="gray.5"
              variant="outline"
              radius={100}
              leftIcon={IconPlus}
              onClick={() =>
                open({
                  initial: {
                    parent: task,
                  },
                })
              }
            >
              <Trans>Subtasks</Trans>
            </Button>
          )}
        </ModalCreateTask>
      </Group>

      {isHasData && (
        <Stack gap={5} mt={8}>
          <Card withBorder shadow="none" p={0}>
            <Stack gap={0}>
              <Stack py={5}>
                <ListTaskRowHead />
              </Stack>

              <Divider />

              {subTasks.length === 0 && (
                <Empty hideBorder visible message={<Trans>No subtasks</Trans>} />
              )}

              {subTasks.length > 0 &&
                subTasks.map((task, index) => (
                  <ListTaskRow
                    key={task._id}
                    task={task}
                    prevTask={subTasks[index - 1]}
                    nextTask={subTasks[index + 1]}
                    href={updateTaskPath(pathname, { code: task.code })}
                    groupVariables={groupVariables}
                  />
                ))}
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
};
