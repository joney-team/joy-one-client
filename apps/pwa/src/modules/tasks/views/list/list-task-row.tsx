"use client";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-icon";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCalendar,
  IconFlag,
  IconFlagFilled,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconSubtask,
  IconTagPlus,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { taskPriorities } from "../../tasks-constants";

import { Button } from "@/components/buttons/button";
import Link from "next/link";
import type { TasksQueryVariables } from "../../graphql/queryTasks.graphql";

import { Avatar } from "@/components/avatar";
import type { ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import { useColor } from "@/modules/theme/use-color";
import { nonLoading } from "@/utils/non-loading";
import { classNames } from "@/utils/ui.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTaskMenu } from "../../components/task-menu/task-menu";
import { TaskMenuAction } from "../../components/task-menu/task-menu-types";
import { TaskRowDraggable } from "../../components/task-row-draggable/task-row-draggable";
import { TaskSelectionBox } from "../../components/task-selections/task-selection-box";
import type { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { updateTaskPath } from "../../tasks-route-helpers";
import { DefaultTaskStatusId } from "../../tasks-types";
import { ListTaskRowHeadProps } from "./list-task-row-head";

import styles from "./list-tasks.module.css";

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const ListTaskRow: FC<
  {
    task: TaskDataFragment;
    prevTask: TaskDataFragment | null;
    nextTask: TaskDataFragment | null;
    nextParentTask: TaskDataFragment | null;
    allowEditName?: boolean;
    lastRow?: boolean;
    groupVariables: TasksQueryVariables | null;
    isMarkAsChild?: boolean;
    hideSelection?: boolean;
    droppableOptions?: {
      inherits?: (keyof TaskDataFragment)[];
    };
  } & ListTaskRowHeadProps
> = ({
  task,
  allowEditName = true,
  groupVariables,
  lastRow = false,
  prevTask,
  nextTask,
  nextParentTask,
  droppableOptions = {},
  hideSelection = false,
  hidden = [],
}) => {
  const color = useColor();
  const pathname = usePathname();
  const taskMenu = useTaskMenu({ task, groupVariables });
  const modalCreateTaskRef = useRef<ModalCreateTaskRef | null>(null);
  const droppableRef = useRef<HTMLDivElement | null>(null);

  const { status } = useTaskStatuses(task);
  const { updateTasks } = useUpdateTasks();

  const [isShowSubtasks, setIsShowSubtasks] = useState(false);
  const [isEditName, setIsEditName] = useState(false);

  const onChangeName = useDebouncedCallback((name: string) => {
    if (!task._id || !name) return;
    updateTasks({ _id: task._id, name });
  }, 500);

  const subTasksGroupVariables = useMemo<TasksQueryVariables>(() => {
    return {
      parentId: task._id,
      all: true,
    };
  }, [task._id]);

  const toggleSubTasks = () => {
    setIsShowSubtasks((s) => !s);
  };

  const { getTasks: getSubtasks, tasks: subtasks } = useTasksQuery({
    variables: subTasksGroupVariables,
    isSkipLoadCount: task.childCount === 0,
  });

  useEffect(() => {
    if (isShowSubtasks && task.childCount > 0) {
      getSubtasks();
    }
  }, [getSubtasks, isShowSubtasks, task.childCount]);

  const taskHref = useMemo(() => {
    return updateTaskPath({ pathname, code: task.code });
  }, [pathname, task.code]);

  return (
    <Fragment>
      <Stack gap={0} className={styles.ListTaskRowContainer} ref={droppableRef}>
        <Group
          wrap="nowrap"
          gap={0}
          miw={0}
          h={44}
          w="100%"
          pr={6}
          pos="relative"
          className={classNames(styles.ListTaskRow, {
            [styles.isLastRow]: lastRow,
          })}
          data-task-menu-opened={taskMenu.isOpened}
        >
          <TaskRowDraggable
            task={task}
            groupVariables={groupVariables}
            nextTask={nextTask}
            prevTask={prevTask}
            rootRef={droppableRef}
            isAllowTopDroppable={!!prevTask}
            subTasksGroupVariables={subTasksGroupVariables}
            nextParentTask={nextParentTask}
            droppableOptions={droppableOptions}
            overlayOptions={{ maw: 200, p: 0 }}
          >
            {(draggableRef) => {
              return (
                <Fragment>
                  <Group h="100%" align="center" gap={0}>
                    <ActionIcon
                      ref={draggableRef}
                      component="div"
                      variant="transparent"
                      color="gray"
                      style={{ cursor: "move", outline: "none" }}
                    >
                      <IconGripVertical size={16} strokeWidth={1.2} />
                    </ActionIcon>

                    {!hideSelection && (
                      <TaskSelectionBox
                        task={task}
                        className={styles.TaskSelectionBox}
                        activeClassName={styles.isActive}
                        groupVariables={groupVariables}
                      />
                    )}
                  </Group>

                  <Group flex={1} py={5} gap={5} wrap="nowrap" miw={0}>
                    <Renderer visible={!!task.parentId}>
                      <ThemeIcon color="gray.5" variant="transparent">
                        <IconSubtask size={16} strokeWidth={1.5} />
                      </ThemeIcon>
                    </Renderer>

                    {status && (
                      <ActionIcon
                        variant="subtle"
                        color={status.color ?? "gray"}
                        component="div"
                        onClick={(e) =>
                          taskMenu.open({
                            action: TaskMenuAction.CHANGE_STATUS,
                            target: e.currentTarget,
                            options: {
                              offset: { y: 5 },
                            },
                          })
                        }
                      >
                        <TaskStatusIcon {...status} />
                      </ActionIcon>
                    )}

                    <Group
                      flex={1}
                      gap={10}
                      id="pointed"
                      style={{
                        cursor: isEditName ? "text" : "pointer",
                        position: "relative",
                      }}
                      wrap="nowrap"
                      miw={0}
                      align="stretch"
                    >
                      <Group flex={1} gap={5} wrap="nowrap" align="stretch" miw={0}>
                        {isEditName ? (
                          <ContentEditable
                            fz={14}
                            fw={500}
                            autoFocus
                            value={task.name}
                            onChange={onChangeName}
                            onEnter={() => setIsEditName(false)}
                            onBlur={() => setIsEditName(false)}
                          />
                        ) : (
                          <Fragment>
                            <Text
                              component={Link}
                              href={taskHref}
                              fz={14}
                              fw={500}
                              truncate
                              style={{ outline: "none" }}
                            >
                              {task.name}
                            </Text>

                            {task.tags.length > 0 && (
                              <Group
                                gap={3}
                                wrap="nowrap"
                                className="clickable"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  taskMenu.open({
                                    action: TaskMenuAction.CHANGE_TAGS,
                                    target: e.currentTarget,
                                  });
                                }}
                              >
                                {task.tags.map((tag) => (
                                  <Badge
                                    className="clickable"
                                    color={tag.color || "gray"}
                                    key={tag._id}
                                    size="sm"
                                    variant="light"
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </Group>
                            )}

                            {task.childCount > 0 && (
                              <Group gap={3} wrap="nowrap">
                                <Button
                                  size="compact-xs"
                                  color="gray"
                                  variant="subtle"
                                  leftIcon={IconSubtask}
                                  fw={500}
                                  onClick={toggleSubTasks}
                                >
                                  <NumberFormat value={task.childCount} />
                                </Button>

                                {task.childProgress && (
                                  <Group
                                    flex={1}
                                    justify="end"
                                    gap={5}
                                    onClick={toggleSubTasks}
                                    className="clickable"
                                  >
                                    <Text fz={10}>
                                      <NumberFormat value={task.childProgress} suffix="%" />
                                    </Text>
                                    <Progress value={task.childProgress} w={60} color={"dark"} />
                                  </Group>
                                )}
                              </Group>
                            )}

                            <Group gap={0} px={5} wrap="nowrap" className={styles.HoverToActive}>
                              {allowEditName && (
                                <Tooltip label={<Trans>Edit task name</Trans>}>
                                  <ActionIcon
                                    variant="subtle"
                                    color="gray.6"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsEditName(true);
                                    }}
                                  >
                                    <IconPencil size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              )}

                              {!task.parentId && (
                                <Tooltip label={<Trans>Create subtask</Trans>}>
                                  <ActionIcon
                                    variant="subtle"
                                    color="gray.6"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      modalCreateTaskRef.current?.open({
                                        initial: { parent: task },
                                        onCreated: () => {
                                          setIsShowSubtasks(true);
                                        },
                                      });
                                    }}
                                  >
                                    <IconPlus size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              )}

                              <ActionIcon
                                variant="subtle"
                                color="gray.6"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  taskMenu.open({
                                    target: e.currentTarget,
                                    action: TaskMenuAction.CHANGE_TAGS,
                                  });
                                }}
                              >
                                <IconTagPlus size={14} />
                              </ActionIcon>
                            </Group>
                          </Fragment>
                        )}

                        <Box
                          bg="transparent"
                          component={Link}
                          href={taskHref}
                          flex={1}
                          h="100%"
                          mih={0}
                        />
                      </Group>
                    </Group>

                    {!hidden.includes("assigneeUsers") && (
                      <Group
                        w={150}
                        px={6}
                        gap={3}
                        className={styles.TaskCell}
                        onClick={(e) => {
                          e.stopPropagation();
                          taskMenu.open({
                            target: e.currentTarget,
                            action: TaskMenuAction.CHANGE_ASSIGNEE,
                          });
                        }}
                      >
                        {task.assigneeUsers.length > 0 ? (
                          task.assigneeUsers.map((member) => {
                            return (
                              <Avatar key={member._id} size={22} user={member} hideOnlineStatus />
                            );
                          })
                        ) : (
                          <Group px={2}>
                            <IconUsers size={16} color={color("gray.4")} />
                          </Group>
                        )}
                      </Group>
                    )}

                    {!hidden.includes("customer") && (
                      <Group
                        w={200}
                        px={8}
                        miw={0}
                        className={styles.TaskCell}
                        gap={3}
                        onClick={(e) => {
                          e.stopPropagation();
                          taskMenu.open({
                            target: e.currentTarget,
                            action: TaskMenuAction.CHANGE_CUSTOMER,
                          });
                        }}
                      >
                        <IconUser size={16} color={color(task.customer ? "primary.3" : "gray.4")} />
                        {task.customer && (
                          <Text fz={12} fw={500} c="gray" truncate>
                            {task.customer.name}
                          </Text>
                        )}
                      </Group>
                    )}

                    {!hidden.includes("dueDate") && (
                      <Group
                        w={150}
                        px={8}
                        className={styles.TaskCell}
                        gap={3}
                        onClick={(e) => {
                          e.stopPropagation();
                          taskMenu.open({
                            target: e.currentTarget,
                            action: TaskMenuAction.CHANGE_TIMELINE,
                          });
                        }}
                      >
                        <IconCalendar
                          size={16}
                          color={color(
                            task.dueDate
                              ? task.dueDate < DateTime.getNowInSeconds() &&
                                task.status !== DefaultTaskStatusId.CLOSED
                                ? "red"
                                : "primary.3"
                              : "gray.4"
                          )}
                        />
                        {task.dueDate && (
                          <Text fz={12} fw={500} c="gray">
                            <DateFormat value={task.dueDate} type="date" />
                          </Text>
                        )}
                      </Group>
                    )}

                    {!hidden.includes("priority") && (
                      <Group
                        w={70}
                        px={8}
                        className={styles.TaskCell}
                        onClick={(e) => {
                          taskMenu.open({
                            target: e.currentTarget,
                            action: TaskMenuAction.CHANGE_PRIORITY,
                          });
                        }}
                      >
                        {task.priority ? (
                          <IconFlagFilled
                            size={16}
                            color={color(taskPriorities[task.priority].color)}
                          />
                        ) : (
                          <IconFlag size={16} color={color("gray.4")} />
                        )}
                      </Group>
                    )}
                  </Group>
                </Fragment>
              );
            }}
          </TaskRowDraggable>
        </Group>
      </Stack>

      {isShowSubtasks &&
        subtasks.map((subtask, subtaskIndex) => (
          <ListTaskRow
            key={subtask._id}
            task={subtask}
            prevTask={subtasks[subtaskIndex - 1]}
            nextTask={subtasks[subtaskIndex + 1]}
            nextParentTask={nextTask}
            groupVariables={subTasksGroupVariables}
          />
        ))}

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Fragment>
  );
};
