"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { NumberFormat } from "@/components/format/number-format";
import { Trans } from "@lingui/react/macro";
import { Card, Divider, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconPlus, IconSubtask } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useMemo, type FC } from "react";
import { useQueryTasks } from "./hooks/use-query-tasks";
import { ModalCreateTask } from "./modals/modal-create-task";
import { TaskDataFragment } from "./queries/fragmentTask.graphql";
import { type TasksQueryVariables } from "./queries/queryTasks.graphql";
import { ListTaskRow } from "./views/list/list-task-row";
import { ListTaskRowHead } from "./views/list/list-task-row-head";

export const TaskDetailSubtasks: FC<{ parent: TaskDataFragment }> = ({ parent }) => {
  const pathname = usePathname();

  const groupVariables: TasksQueryVariables = useMemo(
    () => ({
      parentId: parent._id,
      all: true,
    }),
    [parent._id]
  );

  const { tasks: subTasks, loading } = useQueryTasks(groupVariables);

  if (parent.parent) return null;

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
            <NumberFormat value={parent.progress ?? 0} suffix="%" />
          </Text>
          <Progress value={parent.progress ?? 0} w={70} color={"dark"} />
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
                    parent,
                  },
                })
              }
            >
              <Trans>Subtasks</Trans>
            </Button>
          )}
        </ModalCreateTask>
      </Group>

      {!loading && (
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
                    href={pathname.replace(`/${parent.code}`, `/${task.code}`)}
                  />
                ))}
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
};
