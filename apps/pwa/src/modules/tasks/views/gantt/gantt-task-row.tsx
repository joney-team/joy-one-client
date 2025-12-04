"use client";

import { ActionIcon, Card, Group, Portal, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  FC,
  Fragment,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TaskDataFragment } from "../../queries/fragmentTask.graphql";
import { ganttConfig } from "./gantt-tasks-config";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { useColor } from "@/modules/theme/use-color";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconArrowRight,
  IconCopyPlus,
  IconGripVertical,
  IconMaximize,
  IconPlus,
  IconSubtask,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";
import { ModalCreateTask } from "../../modals/modal-create-task";
import TASKS_QUERY, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../queries/queryTasks.graphql";
import { updateTaskPath } from "../../tasks-route-helpers";
import { useGantt } from "./gantt-tasks-context";
import { useGanttRefs } from "./gantt-tasks-refs";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";

import { ModalConfirm } from "@/modals/modal-confirm";
import { limitCharacters } from "@joy-one-client/utils/string";
import styles from "./gantt-tasks.module.css";
import MUTATION_DUPLICATE_TASK, {
  type DuplicateTaskMutation,
  type DuplicateTaskMutationVariables,
} from "../../queries/mutationDuplicateTask.graphql";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { NumberFormat } from "@/components/format/number-format";

interface GanttTaskRowProps {
  task: TaskDataFragment;
  prevTask?: TaskDataFragment;
  nextTask?: TaskDataFragment;
  nextParentTask?: TaskDataFragment;
  groupVariables?: TasksQueryVariables;
  isAllowTopDroppable?: boolean;
}

export const GanttTaskRow: FC<GanttTaskRowProps> = ({
  task,
  nextTask,
  prevTask,
  nextParentTask,
  groupVariables,
  isAllowTopDroppable,
}) => {
  const color = useColor();
  const gantt = useGantt();
  const router = useRouter();
  const ganttRefs = useGanttRefs();
  const { updateTasks } = useUpdateTasks();

  const isLastChild = Boolean(task.parent) && !nextTask;

  const [isNameEditing, setIsNameEditing] = useState(false);

  const taskRowDataRef = useRef<HTMLDivElement>(null);
  const taskTimelineRef = useRef<HTMLDivElement>(null);
  const movePointerRef = useRef<HTMLDivElement>(null);
  const estimatingPointerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const estimatedRangeRef = useRef<HTMLDivElement>(null);
  const estimatingStartRef = useRef<number | null>(null);

  const [isShowSubtasks, setIsShowSubtasks] = useState(true);
  const [getSubtasks, { data: subtasksData }] = useLazyQuery<TasksQuery, TasksQueryVariables>(
    TASKS_QUERY,
    {
      nextFetchPolicy: "cache-and-network",
    }
  );

  const subtasks = useMemo(() => {
    return Array.from(subtasksData?.tasks.data ?? []).sort((a, b) => a.order - b.order);
  }, [subtasksData?.tasks.data]);

  const subTasksGroupVariables = useMemo<TasksQueryVariables>(() => {
    return {
      parentId: task._id,
      all: true,
    };
  }, [task._id]);

  const [duplicate, { loading: isDuplicating }] = useMutation<
    DuplicateTaskMutation,
    DuplicateTaskMutationVariables
  >(MUTATION_DUPLICATE_TASK);

  useEffect(() => {
    if (isShowSubtasks && task.childCount > 0) {
      getSubtasks({ variables: subTasksGroupVariables });
    }
  }, [task._id, subTasksGroupVariables]);

  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef<HTMLDivElement>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const droppableTopSiblingRef = useRef<HTMLDivElement>(null);
  const droppableTopChildrenRef = useRef<HTMLDivElement>(null);

  const droppableBottomSiblingRef = useRef<HTMLDivElement>(null);
  const droppableBottomChildrenRef = useRef<HTMLDivElement>(null);

  const droppableIndicatorTopRef = useRef<HTMLDivElement>(null);
  const droppableIndicatorTopIndentRef = useRef<HTMLDivElement>(null);

  const droppableIndicatorBottomRef = useRef<HTMLDivElement>(null);
  const droppableIndicatorBottomIndentRef = useRef<HTMLDivElement>(null);

  // Drag drop handlers
  useEffect(() => {
    if (
      !draggingRef.current ||
      !droppableBottomSiblingRef.current ||
      !droppableBottomChildrenRef.current ||
      !droppableTopSiblingRef.current
    )
      return;

    return combine(
      draggable({
        element: draggingRef.current,
        getInitialData() {
          return { task, groupVariables };
        },
        onDrop() {
          setIsDragging(false);
        },
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: () => ({ x: 24, y: 24 }),
            render: ({ container }) => {
              draggingRefContainer.current = container;
              setIsDragging(true);
            },
          });
        },
      }),
      // Sibling Top drop target
      dropTargetForElements({
        element: droppableTopSiblingRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask || !isAllowTopDroppable) return false;

          return (
            sourceTask._id !== task._id &&
            sourceTask._id !== task.parentId &&
            sourceTask._id !== nextTask?._id &&
            !task.parentId
          );
        },
        onDragEnter() {
          droppableIndicatorTopRef.current?.style.setProperty("display", "block");
        },
        onDragLeave() {
          droppableIndicatorTopRef.current?.style.setProperty("display", "none");
        },
        onDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          return updateTasks({
            _id: sourceTask._id,
            parent: null,
            order: ((prevTask?.order ?? task.order / 2) + task.order) / 2,
            folder: task.folder ?? null,
            context,
          });
        },
      }),
      // Sibling Bottom drop target
      dropTargetForElements({
        element: droppableBottomSiblingRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return false;

          if (isLastChild && !sourceTask.parentId && sourceTask._id !== task.parentId) {
            return true;
          }

          return (
            sourceTask._id !== task._id &&
            sourceTask._id !== task.parentId &&
            sourceTask._id !== nextTask?._id &&
            !task.parentId
          );
        },
        onDragEnter() {
          droppableIndicatorBottomRef.current?.style.setProperty("display", "block");
        },
        onDragLeave() {
          droppableIndicatorBottomRef.current?.style.setProperty("display", "none");
        },
        onDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          if (isLastChild) {
            if (!task.parent) return;

            return updateTasks({
              _id: sourceTask._id,
              parent: null,
              folder: task.parent.folder ?? null,
              order: ((nextParentTask?.order ?? task.parent.order * 2) + task.parent.order) / 2,
              context,
            });
          }

          return updateTasks({
            _id: sourceTask._id,
            parent: null,
            order: ((nextTask?.order ?? task.order * 2) + task.order) / 2,
            folder: task.folder ?? null,
            context,
          });
        },
      }),
      // Children Bottom drop target
      dropTargetForElements({
        element: droppableBottomChildrenRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return false;

          return (
            sourceTask._id !== task._id &&
            sourceTask._id !== task.parentId &&
            sourceTask.childCount === 0
          );
        },
        onDragEnter() {
          droppableIndicatorBottomIndentRef.current?.style.setProperty("display", "block");
        },
        onDragLeave() {
          droppableIndicatorBottomIndentRef.current?.style.setProperty("display", "none");
        },
        onDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: task.parent ? groupVariables : subTasksGroupVariables,
          };

          const newOrder = !task.parent
            ? task.childOrders && task.childOrders[0]
              ? task.childOrders[0] / 2
              : 1
            : ((nextTask?.order ?? task.order * 2) + task.order) / 2;

          return updateTasks({
            _id: sourceTask._id,
            parent: task.parent ?? task,
            folder: task.folder ?? null,
            order: newOrder,
            context,
          });
        },
      }),
      monitorForElements({
        onDragStart: () => {
          droppableTopSiblingRef.current?.style.setProperty("display", "block");
          droppableTopChildrenRef.current?.style.setProperty("display", "block");
          droppableBottomSiblingRef.current?.style.setProperty("display", "block");
          droppableBottomChildrenRef.current?.style.setProperty("display", "block");
        },
        onDrop() {
          droppableTopSiblingRef.current?.style.setProperty("display", "none");
          droppableTopChildrenRef.current?.style.setProperty("display", "none");
          droppableBottomSiblingRef.current?.style.setProperty("display", "none");
          droppableBottomChildrenRef.current?.style.setProperty("display", "none");
          droppableIndicatorTopRef.current?.style.setProperty("display", "none");
          droppableIndicatorTopIndentRef.current?.style.setProperty("display", "none");
          droppableIndicatorBottomRef.current?.style.setProperty("display", "none");
          droppableIndicatorBottomIndentRef.current?.style.setProperty("display", "none");
        },
      })
    );
  }, [task, nextTask, nextParentTask, groupVariables, subTasksGroupVariables]);

  const onUpdateName = useDebouncedCallback((name: string) => {
    if (!task._id || name === task.name) return;
    updateTasks({ _id: task._id, name });
  }, 500);

  useEffect(() => {
    if (!taskTimelineRef.current || !taskRowDataRef.current) return;

    const syncPosition = async () => {
      const offsetTop = taskRowDataRef.current?.offsetTop ?? 0;
      const top = offsetTop - ganttConfig.headHeight;

      taskTimelineRef.current?.style.setProperty("top", `${top}px`);
      taskTimelineRef.current?.style.setProperty("opacity", `1`);
      taskTimelineRef.current?.style.setProperty(
        "height",
        `${taskRowDataRef.current?.offsetHeight}px`
      );
    };

    syncPosition();

    const mutationObserver = new MutationObserver(syncPosition);

    mutationObserver.observe(ganttRefs.sidebarContainer.current, {
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(syncPosition);
    resizeObserver.observe(taskRowDataRef.current);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [task._id]);

  const onTaskTimelineMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!taskTimelineRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

    movePointerRef.current?.style.setProperty("left", `${x}px`);

    if (estimatingStartRef.current) {
      const width = x - estimatingStartRef.current;
      if (width < 20) return;
      estimatingPointerRef.current?.style.setProperty("width", `${width}px`);
      movePointerRef.current?.style.setProperty("opacity", `0`);
    } else {
      movePointerRef.current?.style.setProperty("opacity", `1`);
    }
  };

  const onTaskTimelineMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!taskTimelineRef.current || !estimatingPointerRef.current || e.button !== 0) return;
      const rect = e.currentTarget.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfColumn = Math.floor(x / gantt.state.columnSize);
      const startOfColumn = indexOfColumn * gantt.state.columnSize;

      estimatingStartRef.current = startOfColumn;

      estimatingPointerRef.current.style.setProperty("opacity", `1`);
      estimatingPointerRef.current.style.setProperty("left", `${estimatingStartRef.current}px`);
      estimatedRangeRef.current?.style.setProperty("display", `none`);
    },
    [taskTimelineRef.current, estimatingPointerRef.current, gantt.state.columnSize]
  );

  const onTaskTimelineMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!taskTimelineRef.current || !estimatingStartRef.current || e.button !== 0) return;
      const rect = e.currentTarget.getBoundingClientRect();

      const x = Math.max(0, Math.round(e.pageX - rect.left - (window.scrollX || window.scrollX)));

      const indexOfStartColumn = Math.floor(estimatingStartRef.current / gantt.state.columnSize);
      const indexOfEndColumn = Math.floor(x / gantt.state.columnSize);
      const startColumn = gantt.columns[indexOfStartColumn];
      const endColumn = gantt.columns[indexOfEndColumn];

      if (startColumn && endColumn) {
        updateTasks({
          _id: task._id,
          startDate: DateTime.toSeconds(startColumn.start),
          dueDate: DateTime.toSeconds(endColumn.end),
        });
      }

      // Reset
      estimatingStartRef.current = null;
      estimatingPointerRef.current?.style.setProperty("opacity", `0`);
      estimatingPointerRef.current?.style.removeProperty("width");
      estimatedRangeRef.current?.style.setProperty("display", `block`);
    },
    [taskTimelineRef.current, estimatingPointerRef.current, gantt.state.columnSize, gantt.columns]
  );

  const onTaskTimelineMouseEnter = useCallback(() => {
    taskRowDataRef.current?.setAttribute("hovered", "true");
  }, [taskTimelineRef.current, actionsRef.current]);

  const onTaskTimelineMouseLeave = useCallback(() => {
    taskRowDataRef.current?.removeAttribute("hovered");
    movePointerRef.current?.style.setProperty("opacity", "0");
  }, [taskTimelineRef.current, actionsRef.current]);

  const onTaskTimelineWheel = useCallback(() => {
    movePointerRef.current?.style.setProperty("opacity", "0");
  }, [taskTimelineRef.current, actionsRef.current]);

  const onOnActions = () => {
    actionsRef.current?.style.setProperty("display", "flex");
  };

  const onOffActions = () => {
    actionsRef.current?.style.setProperty("display", "none");
  };

  const estimated = useMemo(() => {
    if (task.startDate && task.dueDate) {
      const startDate = DateTime.toSeconds(task.startDate);
      const dueDate = DateTime.toSeconds(task.dueDate);

      const startIndexCaptured = gantt.columns.findIndex(
        (column) =>
          DateTime.toSeconds(column.start) >= startDate ||
          DateTime.toSeconds(column.end) >= startDate
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
        left: startIndex * gantt.state.columnSize,
        width: (endIndex - startIndex + 1) * gantt.state.columnSize,
      };
    }
  }, [task.startDate, task.dueDate, gantt.columns, gantt.state.columnSize]);

  const duplicateTask = async () => {
    try {
      await duplicate({
        variables: {
          id: task._id,
          overwrite: {
            name: `${task.name} ${t`Copy`}`,
            order: ((nextTask?.order ?? task.order * 2) + task.order) / 2,
          },
        },
        refetchQueries: [
          {
            query: TASKS_QUERY,
            variables: groupVariables,
          },
        ],
        awaitRefetchQueries: true,
      });
    } catch (error) {
      onError(error);
    }
  };

  const openTask = () => {
    onOffActions();
    router.push(updateTaskPath(location.pathname, { code: task.code }));
  };

  return (
    <Fragment>
      <Group
        ref={taskRowDataRef}
        className={styles.TaskRowData}
        w="100%"
        bg={isDragging ? "gray.1" : "transparent"}
        miw={0}
        gap={0}
        style={{
          position: "relative",
          overflow: "visible",
          height: "max-content",
          borderBottom: `1px solid var(--app-divider-color)`,
        }}
        onMouseEnter={() => {
          taskTimelineRef.current?.setAttribute("hovered", "true");
          onOnActions();
        }}
        onMouseLeave={() => {
          taskTimelineRef.current?.removeAttribute("hovered");
          onOffActions();
        }}
        wrap="nowrap"
        py={8}
      >
        <ActionIcon
          ref={draggingRef}
          className={styles.DragHandle}
          variant="transparent"
          color="gray"
          component="div"
          style={{ cursor: "move", outline: "none" }}
        >
          <IconGripVertical size={16} strokeWidth={1.2} />
        </ActionIcon>

        {task.parent && (
          <ThemeIcon color="gray" variant="transparent" ml={10}>
            <IconSubtask size={16} strokeWidth={1.5} />
          </ThemeIcon>
        )}

        <Group miw={0} flex={1} pr={8}>
          {isNameEditing ? (
            <ContentEditable
              fz={14}
              fw={500}
              value={task.name}
              autoFocus
              onChange={onUpdateName}
              onBlur={(value) => {
                onUpdateName(value);
                setIsNameEditing(false);
              }}
              onEscape={() => setIsNameEditing(false)}
            />
          ) : (
            <Text
              fz={14}
              fw={500}
              flex={1}
              truncate
              onClick={() => setIsNameEditing(true)}
              className="clickable"
            >
              {task.name}
            </Text>
          )}
        </Group>

        <Group ref={actionsRef} px={8} style={{ display: "none" }} gap={2}>
          <ActionIcon variant="subtle" size="sm" color="gray" onClick={openTask}>
            <IconMaximize size={16} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            loading={isDuplicating}
            onClick={duplicateTask}
          >
            <IconCopyPlus size={16} />
          </ActionIcon>

          <ModalConfirm>
            {(open) => (
              <ActionIcon
                variant="subtle"
                color="gray"
                component="div"
                size="sm"
                disabled={task.isArchived ?? false}
                onClick={() => {
                  const taskName = limitCharacters(task.name, 30);
                  onOffActions();

                  open({
                    color: "red",
                    children: (
                      <Stack>
                        <Text>
                          <Trans>
                            Are you sure you want to archive <strong>{taskName}</strong>?
                          </Trans>
                        </Text>

                        {task.childCount > 0 && (
                          <Text>
                            <Trans>
                              <strong>
                                <NumberFormat value={task.childCount} />
                              </strong>{" "}
                              subtask(s) will be archived as well.
                            </Trans>
                          </Text>
                        )}
                      </Stack>
                    ),
                    onConfirm: () =>
                      updateTasks({
                        _id: task._id,
                        isArchived: true,
                        context: { fromGroupVariables: groupVariables },
                      }),
                  });
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </ModalConfirm>

          {!task.parent && (
            <ModalCreateTask>
              {(open) => (
                <Tooltip.Floating label={<Trans>Create subtask</Trans>} offset={16}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    component="div"
                    size="sm"
                    onClick={() => {
                      onOffActions();
                      open({
                        initial: { parent: task },
                        onCreated: () => {
                          setIsShowSubtasks(true);
                          getSubtasks({ variables: subTasksGroupVariables });
                        },
                      });
                    }}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Tooltip.Floating>
              )}
            </ModalCreateTask>
          )}

          <Tooltip.Floating
            label={
              task.startDate ? (
                <Trans>Scroll to task</Trans>
              ) : (
                <Trans>You need to set the start date before</Trans>
              )
            }
            position="top"
            offset={16}
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              component="div"
              size="sm"
              disabled={!task.startDate}
              onClick={() => {
                if (!task.startDate) return;
                gantt.scrollToDate({ date: task.startDate, behavior: "smooth" });
              }}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip.Floating>
        </Group>

        <div
          ref={droppableIndicatorTopRef}
          style={{
            position: "absolute",
            height: ganttConfig.rowDroppableIndicatorHeight,
            background: color("primary"),
            width: "100%",
            right: 0,
            top: 0,
            display: "none",
          }}
        />

        <div
          ref={droppableIndicatorTopIndentRef}
          style={{
            position: "absolute",
            height: ganttConfig.rowDroppableIndicatorHeight,
            background: color("orange"),
            width: "calc(100% - 46px)",
            right: 0,
            top: 0,
            display: "none",
          }}
        />

        <div
          ref={droppableIndicatorBottomRef}
          style={{
            position: "absolute",
            height: ganttConfig.rowDroppableIndicatorHeight,
            background: color("primary"),
            width: "100%",
            right: 0,
            bottom: 0,
            transform: "translateY(100%)",
            display: "none",
          }}
        />

        <div
          ref={droppableIndicatorBottomIndentRef}
          style={{
            position: "absolute",
            height: ganttConfig.rowDroppableIndicatorHeight,
            background: color("orange"),
            width: "calc(100% - 46px)",
            transform: "translateY(100%)",
            right: 0,
            bottom: 0,
            display: "none",
          }}
        />

        <div
          ref={droppableTopSiblingRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "50%",
            width: "100%",
            display: "none",
            zIndex: 1,
          }}
        />

        <div
          ref={droppableTopChildrenRef}
          style={{
            position: "absolute",
            left: "20%",
            top: 0,
            height: "50%",
            width: "100%",
            display: "none",
            zIndex: 2,
          }}
        />

        <div
          ref={droppableBottomSiblingRef}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: "50%",
            width: "100%",
            display: "none",
            zIndex: 1,
          }}
        />

        <div
          ref={droppableBottomChildrenRef}
          style={{
            position: "absolute",
            left: "20%",
            bottom: 0,
            height: "50%",
            width: "100%",
            display: "none",
            zIndex: 2,
          }}
        />
      </Group>

      {ganttRefs.body.current &&
        createPortal(
          <Fragment>
            <div
              ref={taskTimelineRef}
              className={styles.TaskRowTimeline}
              style={{
                position: "absolute",
                height: taskRowDataRef.current?.offsetHeight,
                width: "100%",
                left: 0,
                zIndex: 1,
                opacity: 0,
              }}
              onMouseMove={onTaskTimelineMouseMove}
              onMouseDown={onTaskTimelineMouseDown}
              onMouseUp={onTaskTimelineMouseUp}
              onMouseEnter={onTaskTimelineMouseEnter}
              onMouseLeave={onTaskTimelineMouseLeave}
              onWheel={onTaskTimelineWheel}
            >
              <div
                ref={movePointerRef}
                className={styles.MovePointer}
                style={{ borderColor: color("primary.3"), opacity: 0 }}
              />

              <div
                ref={estimatingPointerRef}
                className={styles.EstimatingPointer}
                style={{ background: color("primary.3"), opacity: 0 }}
              />

              {estimated && (
                <div
                  ref={estimatedRangeRef}
                  className={styles.EstimatedRange}
                  style={{
                    left: estimated?.left,
                    width: estimated?.width,
                    background: color("primary.4"),
                  }}
                />
              )}
            </div>
          </Fragment>,
          ganttRefs.body.current,
          task._id + "-timeline"
        )}

      {isDragging && draggingRefContainer.current && (
        <Portal target={draggingRefContainer.current}>
          <Card
            shadow="xs"
            px={16}
            style={{ width: taskRowDataRef.current?.getBoundingClientRect().width }}
          >
            <Text fz="sm" fw={500} truncate>
              {task.name}
            </Text>
          </Card>
        </Portal>
      )}

      {isShowSubtasks &&
        subtasks.map((subtask, subtaskIndex) => (
          <GanttTaskRow
            key={subtask._id}
            task={subtask}
            prevTask={subtasks[subtaskIndex - 1]}
            nextTask={subtasks[subtaskIndex + 1]}
            nextParentTask={nextTask}
            groupVariables={subTasksGroupVariables}
          />
        ))}
    </Fragment>
  );
};
