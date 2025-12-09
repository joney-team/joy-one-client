"use client";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Portal,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCalendar,
  IconCornerDownRight,
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
import { taskPriorities } from "../../task-constants";

import { Button } from "@/components/buttons/button";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import Link from "next/link";
import { TasksQueryVariables } from "../../graphql/queryTasks.graphql";

import { Avatar } from "@/components/avatar";
import { useColor } from "@/modules/theme/use-color";
import { classNames } from "@/utils/ui.utils";
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DateTime } from "@joy-one-client/utils/date-time";
import { motion } from "framer-motion";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";
import { useTaskMenu } from "../../modules/task-menu/task-menu";
import { TaskMenuAction } from "../../modules/task-menu/task-menu-types";
import { TaskSelectionBox } from "../../modules/task-selections/task-selection-box";
import styles from "./list-tasks.module.css";
import { DefaultTaskStatusId } from "../../tasks-types";
import { ListTaskRowHeadProps } from "./list-task-row-head";

export const ListTaskRow: FC<
  {
    task: TaskDataFragment;
    prevTask?: TaskDataFragment | null;
    nextTask?: TaskDataFragment | null;
    href: string;
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
  href,
  groupVariables,
  lastRow = false,
  prevTask,
  nextTask,
  isMarkAsChild = false,
  droppableOptions = {},
  hideSelection = false,
  hidden = [],
}) => {
  const color = useColor();
  const taskMenu = useTaskMenu({ task, groupVariables });
  const droppableRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<HTMLDivElement | null>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const { updateTasks } = useUpdateTasks();

  const [isEditName, setIsEditName] = useState(false);
  const [over, setOver] = useState<{ edge: Edge; rect: DOMRect } | null>(null);

  const onChangeName = useDebouncedCallback((name: string) => {
    if (!task._id || !name) return;
    updateTasks({ _id: task._id, name });
  }, 500);

  useEffect(() => {
    if (!draggingRef.current || !droppableRef.current) return;

    return combine(
      draggable({
        element: draggingRef.current,
        getInitialData: ({ element }) => ({
          task,
          groupVariables,
          rect: element.getBoundingClientRect(),
        }),
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
      dropTargetForElements({
        element: droppableRef.current,
        getData: ({ element, input }) => {
          return attachClosestEdge(
            { task, groupVariables },
            { element, input, allowedEdges: ["top", "bottom"] }
          );
        },
        onDragEnter({ source, self }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setOver({ edge: closestEdge, rect: source.data.rect as DOMRect });
        },
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return false;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return false;
          return true;
        },
        onDragLeave({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id) return;

          setOver(null);
        },
        onDrag({ source, self }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setOver((s) => {
            if (s?.edge === closestEdge) return s;
            return { edge: closestEdge, rect: source.data.rect as DOMRect };
          });
        },
        onDrop({ source, self }) {
          setOver(null);

          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          const inherits =
            droppableOptions.inherits?.reduce<Partial<TaskDataFragment>>(
              (acc, key) => ({
                ...acc,
                [key]: task[key],
              }),
              {}
            ) ?? {};

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          if (closestEdge === "top") {
            const order = (task.order + (prevTask?.order ?? 0)) / 2;
            updateTasks([
              {
                _id: sourceTask._id,
                order,
                ...inherits,
                context,
              },
            ]);
          }

          if (closestEdge === "bottom") {
            const order = (task.order + (nextTask?.order ?? 0.5)) / 2;
            updateTasks([
              {
                _id: sourceTask._id,
                order,
                ...inherits,
                context,
              },
            ]);
          }
        },
      })
    );
  }, [task, groupVariables]);

  const droppableShadow = useMemo(() => {
    if (!over) return null;

    return (
      <motion.div
        style={{
          height: 38,
          width: "100%",
          background: "var(--mantine-color-gray-outline-hover)",
          borderBottom: `1px solid var(--mantine-color-gray-light)`,
        }}
        animate={{ height: 44, transition: { duration: 0.2 } }}
      />
    );
  }, [over]);

  const toggleSubTasks = () => {
    // TODO: Toggle subtasks
    // setIsSubTasksVisible((s) => !s)
  };
  const indexSpacing = isMarkAsChild ? 16 : 0;

  const { status } = useTaskStatuses(task);

  return (
    <Fragment>
      <Stack gap={0} className={styles.ListTaskRowContainer} ref={droppableRef}>
        {over && over.edge === "top" && droppableShadow}

        <Group
          wrap="nowrap"
          gap={0}
          miw={0}
          h={44}
          w="100%"
          opacity={isDragging ? 0.5 : 1}
          pr={6}
          style={{
            position: "relative",
          }}
          className={classNames(styles.ListTaskRow, {
            [styles.isLastRow]: lastRow,
          })}
          data-task-menu-opened={taskMenu.isOpened}
        >
          <Group h="100%" align="center" gap={0}>
            <ActionIcon
              ref={draggingRef}
              component="div"
              variant="transparent"
              color="gray"
              style={{ cursor: "move", outline: "none" }}
            >
              <IconGripVertical size={16} strokeWidth={1.2} />
            </ActionIcon>

            {!hideSelection && (
              <TaskSelectionBox
                className={styles.TaskSelectionBox}
                task={task}
                groupVariables={groupVariables}
              />
            )}
          </Group>

          <Group pl={indexSpacing} flex={1} py={5} gap={5} wrap="nowrap" miw={0}>
            <Renderer visible={isMarkAsChild}>
              <ThemeIcon size="xs" color="gray" variant="transparent">
                <IconCornerDownRight strokeWidth={1.5} />
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
                    offset: { y: 5 },
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
            >
              <Group flex={1} gap={5} wrap="nowrap" style={{ overflow: "hidden" }}>
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
                  <Text
                    component={Link}
                    href={href}
                    fz={14}
                    fw={500}
                    truncate
                    style={{ outline: "none" }}
                  >
                    {task.name}
                  </Text>
                )}

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
                        size="xs"
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
                      color="gray.8"
                      variant="subtle"
                      leftIcon={IconSubtask}
                      fw={500}
                      onClick={toggleSubTasks}
                    >
                      <NumberFormat value={task.childCount} />
                    </Button>

                    {task.progress && (
                      <Group flex={1} justify="end" gap={5}>
                        <Text fz={10}>
                          <NumberFormat value={task.progress} suffix="%" />
                        </Text>
                        <Progress value={task.progress} w={60} color={"dark"} />
                      </Group>
                    )}
                  </Group>
                )}
              </Group>

              <Group gap={2} wrap="nowrap" pl={35} className={styles.HoverToActive}>
                {!task.parentId && (
                  <ModalCreateTask>
                    {(onCreateTask) => (
                      <Tooltip label={<Trans>Create subtask</Trans>}>
                        <ActionIcon
                          variant="subtle"
                          color="gray.6"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCreateTask({ initial: { parent: task } });
                          }}
                        >
                          <IconPlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </ModalCreateTask>
                )}

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
                      <IconPencil size={16} />
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
                  <IconTagPlus size={16} />
                </ActionIcon>
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
                    return <Avatar key={member._id} size={22} user={member} hideOnlineStatus />;
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
                  <IconFlagFilled size={16} color={color(taskPriorities[task.priority].color)} />
                ) : (
                  <IconFlag size={16} color={color("gray.4")} />
                )}
              </Group>
            )}
          </Group>
        </Group>

        {over && over.edge === "bottom" && droppableShadow}
      </Stack>

      {isDragging && draggingRefContainer.current && (
        <Portal target={draggingRefContainer.current}>
          <Card shadow="xs" py={0} px={15} h={44} miw={300}>
            <Group align="center" h="100%">
              <Text fz={16} fw={500} lineClamp={2}>
                {task.name}
              </Text>
            </Group>
          </Card>
        </Portal>
      )}
    </Fragment>
  );
};
