"use client";

import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { formatDuration } from "@/components/inputs/estimate-time-input/estimate-time-input-utils";
import { TaskContextType } from "@/graphql/enums.graphql";
import { InternalEvent, onInternalEvent } from "@/hooks/use-internal-event";
import { TagDataFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import { useColor } from "@/modules/theme/use-color";
import { nonLoading } from "@/utils/non-loading";
import { DateTime } from "@joy-one-client/utils/date-time";
import { requestAnimationFrameTimes } from "@joy-one-client/utils/request-animation-frame";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, alpha, Badge, Box, Group, Loader, Stack, Text, Tooltip } from "@mantine/core";
import { IconFolder, IconFolderOpen, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useMemo, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";
import { TasksQueryVariables } from "../../graphql/queryTasks.graphql";
import { useTaskMetrics } from "../../hooks/use-task-metrics";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import { type ModalCreateTaskRef } from "../../modals/modal-create-task";
import { useTaskSelections } from "../../modules/task-selections/task-selections-context";
import { useTasks } from "../../tasks-context";
import { ganttConfig } from "./gantt-tasks-config";
import { useGantt } from "./gantt-tasks-context";
import { useGanttRefs } from "./gantt-tasks-refs";

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
  const gantt = useGantt();
  const ganttRefs = useGanttRefs();
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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
      ...state.variables,
      folderId: folder?._id ?? "none",
      parentId: "root",
      isProgressOnly: state.showClosed ? false : true,
    };
  }, [folder?._id, state.showClosed, state.variables]);

  const { getTasks, tasks, loading, count } = useTasksQuery({ variables: groupVariables });

  const { metric } = useTaskMetrics({
    contextType: TaskContextType.Folder,
    contextId: folder?._id,
  });

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

  // Sync the position of the gantt task area
  useEffect(() => {
    const syncPosition = async () => {
      const offsetTop = rootRef.current?.offsetTop ?? 0;
      const top = offsetTop - ganttConfig.headHeight;

      requestAnimationFrameTimes(() => {
        bodyRef.current?.style.setProperty("top", `${top}px`);
        bodyRef.current?.style.setProperty("height", `${rootRef.current?.offsetHeight}px`);
      });
    };

    syncPosition();

    const mutationObserver = new MutationObserver(syncPosition);

    mutationObserver.observe(ganttRefs.sidebarContainer.current, {
      childList: true,
      subtree: true,
    });

    mutationObserver.observe(ganttRefs.body.current, {
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(syncPosition);
    if (rootRef.current) resizeObserver.observe(rootRef.current);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [folder?._id]);

  const timeline = useMemo<{
    startIndex: number;
    endIndex: number;
    left: number;
    width: number;
    startDate: number;
    dueDate: number;
  } | null>(() => {
    if (!metric || !metric.startDate || !metric.dueDate) return null;

    const startDate = metric.startDate;
    const dueDate = metric.dueDate;

    const startIndexCaptured = gantt.columns.findIndex(
      (column) =>
        DateTime.toSeconds(column.start) >= startDate || DateTime.toSeconds(column.end) >= startDate
    );

    const startIndex = startIndexCaptured >= 0 ? startIndexCaptured : 0;

    const endIndexCaptured = gantt.columns.findIndex(
      (column) =>
        DateTime.toSeconds(column.end) >= dueDate || DateTime.toSeconds(column.start) >= dueDate
    );

    const endIndex = endIndexCaptured >= 0 ? endIndexCaptured : gantt.columns.length - 1;

    return {
      startIndex,
      endIndex,
      left: startIndex * ganttConfig.columnSize,
      width: (endIndex - startIndex + 1) * ganttConfig.columnSize,
      startDate,
      dueDate,
    };
  }, [metric, gantt.columns]);

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
          ref={rootRef}
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

      {ganttRefs.body.current &&
        createPortal(
          <Fragment>
            <div
              style={{
                position: "absolute",
                height: rootRef.current?.offsetHeight,
                width: "100%",
                left: 0,
                zIndex: 1,
              }}
              ref={bodyRef}
            >
              {!!metric?.estimatedTime && !!gantt.state.isShowEstimatedTime && (
                <Group
                  pos="sticky"
                  style={{
                    width: "max-content",
                    top: 0,
                    left: 0,
                    height: "100%",
                    zIndex: 2,
                  }}
                  px={3}
                  align="center"
                >
                  <Badge bg={alpha(folder?.color ?? "gray", 0.4)} size="xs" tt="none">
                    {formatDuration(metric.estimatedTime)}
                  </Badge>
                </Group>
              )}

              {!!timeline && (
                <Stack
                  pos="absolute"
                  top={0}
                  style={{ left: `${timeline.left}px`, width: timeline.width }}
                  mih="100%"
                  justify="center"
                >
                  <Tooltip.Floating
                    label={
                      <Fragment>
                        <Trans>
                          From <DateFormat value={timeline.startDate} type="date" /> to{" "}
                          <DateFormat value={timeline.dueDate} type="date" />
                        </Trans>

                        {metric?.progress && (
                          <Fragment>
                            {" | "}
                            <Trans>Progress</Trans>: {metric.progress}%
                          </Fragment>
                        )}
                      </Fragment>
                    }
                    style={{ fontSize: 11 }}
                  >
                    <Box
                      h={8}
                      w="100%"
                      bg={alpha(folder?.color ?? "gray", 0.1)}
                      style={{ borderRadius: 3 }}
                    />
                  </Tooltip.Floating>
                </Stack>
              )}
            </div>
          </Fragment>,
          ganttRefs.body.current,
          folder?._id ?? "root" + "-folder-gantt"
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
            nextParentTask={null}
          />
        ))}

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Fragment>
  );
};
