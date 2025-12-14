"use client";

import { NumberFormat } from "@/components/format/number-format";
import { InternalEvent, onInternalEvent } from "@/hooks/use-internal-event";
import { TagDataFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import { useColor } from "@/modules/theme/use-color";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Loader, Text } from "@mantine/core";
import { IconFolder, IconFolderOpen, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useMemo, useRef, useState, type FC } from "react";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import { type ModalCreateTaskRef } from "../../modals/modal-create-task";
import { useTaskSelections } from "../../modules/task-selections/task-selections-context";
import { useTasks } from "../../tasks-context";
import { TasksQueryVariables } from "../../graphql/queryTasks.graphql";

const GanttTask = dynamic(() => import("./gantt-task/gantt-task").then((mod) => mod.GanttTask), {
  ssr: false,
  loading: nonLoading,
});

const ModalCreateTask = dynamic(
  () => import("../../modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  }
);

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
  const { state } = useTasks();
  const [isOpened, setIsOpened] = useState(
    isDefaultOpen || Boolean(localStorage.getItem(`gtg-${folder?._id ?? "d"}`))
  );

  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);
  const { unselect } = useTaskSelections();
  const opened = pure ?? isOpened;
  const color = useColor();

  const folderColor = folder?.color ?? "gray";

  const groupVariables = useMemo<TasksQueryVariables>(() => {
    return {
      folderId: folder?._id ?? "none",
      parentId: "root",
      isProgressOnly: state.showClosed ? false : true,
    };
  }, [folder?._id, state.showClosed]);

  const { getTasks, tasks, loading, count } = useTasksQuery({ variables: groupVariables });

  useEffect(() => {
    if (opened) getTasks();
  }, [opened, getTasks]);

  // Unselect tasks when group is closed
  useEffect(() => {
    if (!opened) unselect(...tasks.map((v) => v._id));
  }, [tasks, opened]);

  const onOpen = () => {
    if (pure) return;

    if (folder?._id) {
      localStorage.setItem(`gtg-${folder?._id}`, "true");
    }

    setIsOpened(true);
  };

  const onClose = () => {
    if (pure) return;

    if (folder?._id) {
      localStorage.removeItem(`gtg-${folder?._id}`);
    }

    setIsOpened(false);
  };

  useEffect(() => {
    return onInternalEvent(InternalEvent.GANTT_TASKS_OPEN_ALL_FOLDER, onOpen);
  }, [onOpen]);

  useEffect(() => {
    return onInternalEvent(InternalEvent.GANTT_TASKS_CLOSE_ALL_FOLDER, onClose);
  }, [onClose]);

  return (
    <Fragment>
      {!pure && (
        <Group
          w="100%"
          miw={0}
          p={8}
          mih={46}
          gap="xs"
          wrap="nowrap"
          style={{
            position: "relative",
            borderBottom: `1px solid var(--app-divider-color)`,
          }}
          onClick={() => {
            if (opened) {
              onClose();
            } else {
              onOpen();
            }
          }}
          className="clickable unselectable"
        >
          <Group gap={6} flex={1} miw={0} wrap="nowrap">
            <ActionIcon component="div" color={color(folderColor)} variant="light" size="sm">
              {opened ? <IconFolderOpen size={14} /> : <IconFolder size={14} />}
            </ActionIcon>

            <Text fz={14} fw={500} truncate>
              {folder?.name ?? <Trans>General tasks</Trans>}{" "}
            </Text>

            {count && count > 0 && (
              <Text fz={12} c="gray.5">
                <NumberFormat value={count} />
              </Text>
            )}

            {loading && <Loader type="dots" size="xs" color="gray" />}
          </Group>

          <ActionIcon
            component="div"
            variant="subtle"
            size="sm"
            color="gray"
            onClick={(e) => {
              e.stopPropagation();
              modalCreateTaskRef.current?.open({ initial: { folder } });
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Group>
      )}

      {opened &&
        tasks.map((task, taskIndex) => (
          <GanttTask
            key={task._id}
            task={task}
            prevTask={tasks[taskIndex - 1]}
            nextTask={tasks[taskIndex + 1]}
            groupVariables={groupVariables}
            isAllowTopDroppable={taskIndex === 0}
          />
        ))}

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Fragment>
  );
};
