"use client";

import { TagDataFragment } from "@/modules/tags/queries/fragmentTag.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useLazyQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Loader, Skeleton, Stack, Text } from "@mantine/core";
import { IconFolder, IconFolderOpen, IconPlus } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState, type FC } from "react";
import { ModalCreateTask } from "../../modals/modal-create-task";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../queries/queryTasks.graphql";
import { GanttTaskRow } from "./gantt-task-row";
import { ganttConfig } from "./gantt-tasks-config";

interface GanttTasksGroupProps {
  folder?: TagDataFragment;
  pure?: boolean;
  isDefaultOpen?: boolean;
}

export const GanttTasksGroup: FC<GanttTasksGroupProps> = ({
  folder,
  pure,
  isDefaultOpen = false,
}) => {
  const [isOpened, setIsOpened] = useState(isDefaultOpen);
  const opened = pure ?? isOpened;
  const color = useColor();

  const folderColor = folder?.color ?? "gray";

  const [getTasks, { data, loading }] = useLazyQuery<TasksQuery, TasksQueryVariables>(QUERY_TASKS, {
    fetchPolicy: "network-only",
  });

  const tasks = useMemo(() => {
    return Array.from(data?.tasks.data ?? []).sort((a, b) => a.order - b.order);
  }, [data]);

  const groupVariables = useMemo(() => {
    return {
      folderId: folder?._id ?? "none",
      parentId: "root",
    };
  }, [folder?._id]);

  useEffect(() => {
    if (opened) {
      getTasks({ variables: groupVariables });
    }
  }, [folder?._id, opened, groupVariables]);

  return (
    <Fragment>
      {!pure && (
        <ModalCreateTask>
          {(openCreateTask) => (
            <Group
              w="100%"
              miw={0}
              px={8}
              gap="xs"
              style={{
                position: "relative",
                minHeight: ganttConfig.rowHeight,
                maxHeight: ganttConfig.rowHeight,
                borderBottom: `1px solid var(--app-divider-color)`,
              }}
              onClick={() => setIsOpened(!opened)}
              className="clickable unselectable"
            >
              <Group gap={6} flex={1} miw={0}>
                <ActionIcon component="div" color={color(folderColor)} variant="light" size="sm">
                  {opened ? <IconFolderOpen size={14} /> : <IconFolder size={14} />}
                </ActionIcon>

                <Text fz={14} fw={500} truncate>
                  {folder?.name ?? <Trans>General tasks</Trans>}
                </Text>

                {loading && <Loader type="dots" size="xs" color="gray" />}
              </Group>

              <ActionIcon
                component="div"
                variant="subtle"
                size="sm"
                color="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  openCreateTask({ initial: { folder } });
                }}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          )}
        </ModalCreateTask>
      )}

      {opened &&
        tasks.map((task, taskIndex) => (
          <GanttTaskRow
            key={task._id}
            task={task}
            prevTask={tasks[taskIndex - 1]}
            nextTask={tasks[taskIndex + 1]}
            groupVariables={groupVariables}
            isAllowTopDroppable={taskIndex === 0}
          />
        ))}
    </Fragment>
  );
};
