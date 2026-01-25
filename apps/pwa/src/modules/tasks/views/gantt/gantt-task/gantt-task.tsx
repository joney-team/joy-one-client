"use client";

import { ActionIcon, Group, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ganttConfig } from "../gantt-tasks-config";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { useMutation } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCopyPlus,
  IconGripVertical,
  IconHourglassHigh,
  IconMaximize,
  IconPlus,
  IconSubtask,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import TASKS_QUERY, { type TasksQueryVariables } from "../../../graphql/queryTasks.graphql";
import { useUpdateTasks } from "../../../hooks/use-update-tasks";
import { ModalCreateTask } from "../../../modals/modal-create-task";
import { updateTaskPath } from "../../../tasks-route-helpers";
import { useGantt } from "../gantt-tasks-context";
import { useGanttRefs } from "../gantt-tasks-refs";

import { NumberFormat } from "@/components/format/number-format";
import { ModalConfirm, ModalConfirmRef } from "@/modals/modal-confirm";
import { useTaskMenu } from "@/modules/tasks/components/task-menu/task-menu";
import { TaskMenuAction } from "@/modules/tasks/components/task-menu/task-menu-types";
import { TaskRowDraggable } from "@/modules/tasks/components/task-row-draggable/task-row-draggable";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { classNames } from "@/utils/ui.utils";
import { limitCharacters } from "@joy-one-client/utils/string";
import { t } from "@lingui/core/macro";
import dynamic from "next/dynamic";
import MUTATION_DUPLICATE_TASK, {
  type DuplicateTaskMutation,
  type DuplicateTaskMutationVariables,
} from "../../../graphql/mutationDuplicateTask.graphql";
import { useTasksQuery } from "../../../hooks/use-tasks-query";
import { TaskSelectionBox } from "../../../components/task-selections/task-selection-box";
import styles from "../gantt-tasks.module.css";
import { GanttTaskRowProvider, useGanttTaskRow } from "./gantt-task-provider";
import { GanttTaskProps } from "./gantt-task-types";

const GanttTaskTimeline = dynamic(
  () => import("./components/gantt-task-timeline").then((mod) => mod.GanttTaskTimeline),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const GanttTaskDrawTimeline = dynamic(
  () => import("./components/gantt-task-draw-timeline").then((mod) => mod.GanttTaskDrawTimeline),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const GanttTaskEstimatedTime = dynamic(
  () => import("./components/gantt-task-estimated-time").then((mod) => mod.GanttTaskEstimatedTime),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const GanttTaskContent: FC = () => {
  const {
    task,
    nextTask,
    groupVariables,
    isAllowTopDroppable,
    prevTask,
    rootRef,
    ganttTaskAreaRef,
    timeline,
    taskStatus,
    nextParentTask,
  } = useGanttTaskRow();

  const gantt = useGantt();
  const router = useRouter();
  const taskMenu = useTaskMenu({ task, groupVariables });
  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const ganttRefs = useGanttRefs();

  const { updateTasks } = useUpdateTasks();

  const [isNameEditing, setIsNameEditing] = useState(false);

  const [isShowSubtasks, setIsShowSubtasks] = useState(true);

  const subTasksGroupVariables = useMemo<TasksQueryVariables>(() => {
    return {
      parentId: task._id,
      all: true,
    };
  }, [task._id]);

  const { getTasks: getSubtasks, tasks: subtasks } = useTasksQuery({
    variables: subTasksGroupVariables,
    isSkipLoadCount: task.childCount === 0,
  });

  const [duplicate, { loading: isDuplicating }] = useMutation<
    DuplicateTaskMutation,
    DuplicateTaskMutationVariables
  >(MUTATION_DUPLICATE_TASK);

  useEffect(() => {
    if (isShowSubtasks && task.childCount > 0) {
      getSubtasks();
    }
  }, [task._id, getSubtasks]);

  const onUpdateName = useDebouncedCallback((name: string) => {
    if (!task._id || name === task.name) return;
    updateTasks({ _id: task._id, name });
  }, 500);

  // Sync the position of the gantt task area
  useEffect(() => {
    if (!ganttTaskAreaRef.current || !rootRef.current) return;

    const syncPosition = async () => {
      const offsetTop = rootRef.current?.offsetTop ?? 0;
      const top = offsetTop - ganttConfig.headHeight;

      ganttTaskAreaRef.current?.style.setProperty("top", `${top}px`);
      ganttTaskAreaRef.current?.style.setProperty("height", `${rootRef.current?.offsetHeight}px`);
    };

    syncPosition();

    const mutationObserver = new MutationObserver(syncPosition);

    mutationObserver.observe(ganttRefs.sidebarContainer.current, {
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(syncPosition);
    resizeObserver.observe(rootRef.current);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [task._id]);

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
        refetchQueries: groupVariables
          ? [
              {
                query: TASKS_QUERY,
                variables: groupVariables,
              },
            ]
          : [],
        awaitRefetchQueries: true,
      });
    } catch (error) {
      onError(error);
    }
  };

  const openTask = () => {
    router.push(updateTaskPath({ code: task.code }));
  };

  return (
    <Fragment>
      <Group
        ref={rootRef}
        className={styles.GanttTask}
        w="100%"
        miw={0}
        gap={0}
        style={{
          position: "relative",
          overflow: "visible",
          height: "max-content",
          borderBottom: `1px solid var(--app-divider-color)`,
        }}
        wrap="nowrap"
        py={5}
        data-task-menu-opened={taskMenu.isOpened}
      >
        <TaskRowDraggable
          task={task}
          groupVariables={groupVariables}
          nextTask={nextTask}
          prevTask={prevTask}
          nextParentTask={nextParentTask}
          subTasksGroupVariables={subTasksGroupVariables}
          rootRef={rootRef}
          disabled={gantt.isGrabbing}
          isAllowTopDroppable={isAllowTopDroppable}
        >
          {(draggingRef) => (
            <Fragment>
              <Group gap={0}>
                <ActionIcon
                  ref={draggingRef}
                  className={classNames("Draggable", styles.TaskSelectionBox)}
                  variant="transparent"
                  color="gray"
                  component="div"
                >
                  <IconGripVertical size={16} strokeWidth={1.2} />
                </ActionIcon>

                <TaskSelectionBox
                  className={styles.TaskSelectionBox}
                  task={task}
                  groupVariables={groupVariables}
                />
              </Group>

              {task.parent && (
                <ThemeIcon color="gray.5" variant="transparent">
                  <IconSubtask size={16} strokeWidth={1.5} />
                </ThemeIcon>
              )}

              <Group miw={0} flex={1} pr={8} gap={5}>
                <Tooltip label={taskStatus.name}>
                  <div
                    className={styles.TaskStatus}
                    onClick={(e) => {
                      taskMenu.open({
                        target: e.currentTarget,
                        action: TaskMenuAction.CHANGE_STATUS,
                        options: { offset: { y: 5 } },
                      });
                    }}
                  >
                    <div className={styles.TaskStatusIcon} />
                  </div>
                </Tooltip>

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

              <Group className={styles.TaskRowActions} px={8} gap={2}>
                <ActionIcon variant="subtle" size="sm" color="gray" onClick={openTask}>
                  <IconMaximize size={16} />
                </ActionIcon>

                {gantt.state.isShowEstimatedTime && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="gray"
                    onClick={(e) =>
                      taskMenu.open({
                        action: TaskMenuAction.CHANGE_ESTIMATE_TIME,
                        target: e.currentTarget,
                      })
                    }
                  >
                    <IconHourglassHigh size={16} />
                  </ActionIcon>
                )}

                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="gray"
                  loading={isDuplicating}
                  onClick={duplicateTask}
                >
                  <IconCopyPlus size={16} />
                </ActionIcon>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  component="div"
                  size="sm"
                  disabled={task.isArchived ?? false}
                  onClick={() => {
                    const taskName = limitCharacters(task.name, 30);

                    modalConfirmRef.current?.open({
                      color: "red",
                      content: (
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

                {!task.parent && (
                  <ModalCreateTask>
                    {(modalCreateTask) => (
                      <Tooltip.Floating label={<Trans>Create subtask</Trans>} offset={16}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          component="div"
                          size="sm"
                          onClick={() => {
                            modalCreateTask.open({
                              initial: { parent: task },
                              onCreated: () => {
                                setIsShowSubtasks(true);
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
              </Group>
            </Fragment>
          )}
        </TaskRowDraggable>
      </Group>

      {ganttRefs.body.current &&
        createPortal(
          <Fragment>
            <div
              ref={ganttTaskAreaRef}
              className={styles.GanttTaskArea}
              style={{
                position: "absolute",
                height: rootRef.current?.offsetHeight,
                width: "100%",
                left: 0,
                zIndex: 1,
              }}
              data-task-menu-opened={taskMenu.isOpened}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                taskMenu.open({
                  action: TaskMenuAction.GANTT_TIMELINE,
                  target: e.currentTarget,
                  scrollToDate: gantt.scrollToDate,
                  options: {
                    offset: {
                      x: Math.abs(e.currentTarget.getBoundingClientRect().x - e.clientX),
                      y: -3,
                    },
                  },
                });
              }}
            >
              <GanttTaskEstimatedTime key={timeline?.startDate + "estimated-time"} />
              <GanttTaskDrawTimeline key={timeline?.startDate + "drawer"} />
              <GanttTaskTimeline key={timeline?.startDate + "timeline"} />
            </div>
          </Fragment>,
          ganttRefs.body.current,
          task._id + "-timeline"
        )}

      {isShowSubtasks &&
        subtasks.map((subtask, subtaskIndex) => (
          <GanttTask
            key={subtask._id}
            task={subtask}
            prevTask={subtasks[subtaskIndex - 1]}
            nextTask={subtasks[subtaskIndex + 1]}
            nextParentTask={nextTask}
            groupVariables={subTasksGroupVariables}
          />
        ))}

      <ModalConfirm ref={modalConfirmRef} />
    </Fragment>
  );
};

export const GanttTask: FC<GanttTaskProps> = (props) => {
  return (
    <GanttTaskRowProvider {...props}>
      <GanttTaskContent />
    </GanttTaskRowProvider>
  );
};
