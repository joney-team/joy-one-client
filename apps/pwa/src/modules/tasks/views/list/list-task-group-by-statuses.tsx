"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "@/modules/tasks/queries/queryTasks.graphql";
import { useTasks } from "@/modules/tasks/tasks-context";
import { renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useLazyQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { IconCaretDownFilled, IconCaretRightFilled, IconPlus } from "@tabler/icons-react";
import { FC, useEffect, useMemo, useState } from "react";
import { ListTaskRowHead } from "./list-task-row-head";

import dynamic from "next/dynamic";
import styles from "./list-tasks.module.css";

const ListTaskRow = dynamic(() => import("./list-task-row").then((mod) => mod.ListTaskRow), {
  ssr: false,
  loading: () => <Skeleton height={22} w="100%" radius={0} />,
});

interface ListTaskGroupByStatusesProps {
  status: string;
  defaultVisible?: boolean;
  hideWhenEmpty?: boolean;
  showEmptyMsg?: boolean;
  folderId?: string;
}

export const ListTaskGroupByStatuses: FC<ListTaskGroupByStatusesProps> = ({
  folderId,
  ...props
}) => {
  const workspace = useWorkspace();
  const ctx = useTasks();

  const [isVisible, setIsVisible] = useState(
    typeof props.defaultVisible === "boolean" ? props.defaultVisible : true
  );

  const isClosedTasks = props.status === DefaultTaskStatusId.CLOSED;

  const variables: TasksQueryVariables = useMemo(() => {
    return {
      status: props.status,
      folderId,
      parentId: "root",
    };
  }, [props.status, folderId]);

  const [getTasks, { data }] = useLazyQuery<TasksQuery, TasksQueryVariables>(QUERY_TASKS, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    getTasks({ variables });
  }, [folderId]);

  const status =
    workspace.settings.taskStatuses.find((s) => s.id === props.status) ||
    workspace.settings.taskStatuses[0];

  const statusStyle = renderTaskStatusStyle(props.status, workspace.settings.taskStatuses);

  const tasks = useMemo(() => {
    return Array.from(data?.tasks.data ?? []).sort((a, b) => a.order - b.order);
  }, [data]);

  if (props.hideWhenEmpty && (data?.tasks.count ?? 0) === 0) return null;

  return (
    <Stack gap={4}>
      <Group gap={10}>
        <Group gap={0} onClick={() => setIsVisible((s) => !s)}>
          <ActionIcon radius={100} variant="transparent" color="gray" ml={-10}>
            {isVisible ? <IconCaretDownFilled size={16} /> : <IconCaretRightFilled size={16} />}
          </ActionIcon>

          <Button
            size="compact-sm"
            variant={isClosedTasks || !status.isDefault ? "filled" : "light"}
            color={statusStyle.color}
            leftSection={
              <TaskStatusIcon {...status} white={isClosedTasks || !status.isDefault} size={16} />
            }
            tt="uppercase"
          >
            {statusStyle.name}
          </Button>
        </Group>

        {!!data?.tasks.count && data.tasks.count > 0 && (
          <Text c="gray" fz={12} fw={500}>
            <NumberFormat value={data.tasks.count} />
          </Text>
        )}

        {!isClosedTasks && (
          <ModalCreateTask>
            {(open) => (
              <Button
                variant="subtle"
                size="compact-xs"
                color="gray"
                leftIcon={IconPlus}
                fw={400}
                onClick={() =>
                  open({
                    status: props.status,
                    folderId: folderId,
                  })
                }
              >
                <Trans>Create task</Trans>
              </Button>
            )}
          </ModalCreateTask>
        )}
      </Group>

      {isVisible && !!data?.tasks.count && data.tasks.count > 0 && (
        <Stack gap={0} w="100%">
          <ListTaskRowHead />

          <Card withBorder shadow="none" p={0} style={{ overflow: "auto" }}>
            <Stack gap={0} miw={0} className={styles.ListTaskRows}>
              {tasks.map((task, index) => (
                <ListTaskRow
                  task={task}
                  key={task._id + folderId}
                  href={ctx.href(task)}
                  variables={variables}
                  lastRow={index === tasks.length - 1}
                  prevTask={tasks[index - 1]}
                  nextTask={tasks[index + 1]}
                />
              ))}
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
};
