"use client";

import { ActionIcon, Group, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { FC, Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ganttConfig } from "../gantt-tasks-config";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { useMutation } from "@apollo/client/react";
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
import { useUpdateTasks } from "../../../hooks/use-update-tasks";
import { ModalCreateTask } from "../../../modals/modal-create-task";
import TASKS_QUERY, { type TasksQueryVariables } from "../../../queries/queryTasks.graphql";
import { updateTaskPath } from "../../../tasks-route-helpers";
import { useGantt } from "../gantt-tasks-context";
import { useGanttRefs } from "../gantt-tasks-refs";

import { NumberFormat } from "@/components/format/number-format";
import { ModalConfirm } from "@/modals/modal-confirm";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { limitCharacters } from "@joy-one-client/utils/string";
import { t } from "@lingui/core/macro";
import dynamic from "next/dynamic";
import { useTasksQuery } from "../../../hooks/use-tasks-query";
import { TaskSelectionBox } from "../../../modules/task-selections/task-selection-box";
import MUTATION_DUPLICATE_TASK, {
  type DuplicateTaskMutation,
  type DuplicateTaskMutationVariables,
} from "../../../queries/mutationDuplicateTask.graphql";
import styles from "../gantt-tasks.module.css";
import { GanttTaskDraggable } from "./components/gantt-task-draggable";
import { GanttTaskRowProvider, useGanttTaskRow } from "./gantt-task-provider";
import { GanttTaskProps } from "./gantt-task-types";
import { classNames } from "@/utils/ui.utils";
import { useTaskMenu } from "@/modules/tasks/modules/task-menu/task-menu";
import { TaskMenuAction } from "@/modules/tasks/modules/task-menu/task-menu-types";

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

const GanttTaskContent: FC = () => {
  const { task, nextTask, groupVariables } = useGanttTaskRow();
  const gantt = useGantt();
  const router = useRouter();
  const taskMenu = useTaskMenu();
  const ganttRefs = useGanttRefs();

  const { rootRef, ganttTaskAreaRef, timeline, taskStatus } = useGanttTaskRow();

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
    router.push(updateTaskPath(location.pathname, { code: task.code }));
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
      >
        <GanttTaskDraggable>
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
                <ThemeIcon color="gray" variant="transparent" ml={10}>
                  <IconSubtask size={16} strokeWidth={1.5} />
                </ThemeIcon>
              )}

              <Group miw={0} flex={1} pr={8} gap={5}>
                <Tooltip label={taskStatus.name}>
                  <div
                    className={styles.TaskStatus}
                    onClick={(e) => {
                      taskMenu.open({
                        groupVariables,
                        target: e.currentTarget,
                        task,
                        action: TaskMenuAction.CHANGE_STATUS,
                        offset: { y: 5 },
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
                            open({
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

                <Tooltip.Floating
                  label={
                    timeline?.startDate ? (
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
                      if (!timeline?.startDate) return;
                      gantt.scrollToDate({ date: timeline?.startDate, behavior: "smooth" });
                    }}
                  >
                    <IconArrowRight size={16} />
                  </ActionIcon>
                </Tooltip.Floating>
              </Group>
            </Fragment>
          )}
        </GanttTaskDraggable>
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
            >
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
