"use client";

import { TagDataFragment } from "@/modules/tags/queries/fragmentTag.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useLazyQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconFolder, IconFolderOpen, IconPlus } from "@tabler/icons-react";
import { Fragment, useEffect, useState, type FC } from "react";
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

  const [getTasks, { data }] = useLazyQuery<TasksQuery, TasksQueryVariables>(QUERY_TASKS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (opened) {
      getTasks({ variables: { folderId: folder?._id ?? null, parentId: "root" } });
    }
  }, [folder?._id, opened]);

  return (
    <Fragment>
      {!pure && (
        <ModalCreateTask>
          {(openCreateTask) => (
            <Group
              w="100%"
              miw="100%"
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
              <ActionIcon component="div" color={color(folderColor)} variant="light">
                {opened ? <IconFolderOpen size={16} /> : <IconFolder size={16} />}
              </ActionIcon>

              <Text fz={14} fw={500} truncate flex={1}>
                {folder?.name ?? <Trans>General tasks</Trans>}
              </Text>

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

      {opened && data?.tasks.data.map((task) => <GanttTaskRow key={task._id} task={task} />)}
    </Fragment>
  );
};
