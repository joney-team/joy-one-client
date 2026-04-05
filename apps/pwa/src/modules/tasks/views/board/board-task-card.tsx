"use client";

import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { WayPoint } from "@/components/way-point";
import { useColor } from "@/modules/theme/use-color";
import { renderEntityCode } from "@/modules/workspaces/utils";
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Group,
  GroupProps,
  Portal,
  Progress,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  Icon,
  IconCalendar,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconFlag,
  IconFlagFilled,
  IconPlaystationCircle,
  IconPlus,
  IconSubtask,
  IconTags,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { FC, Fragment, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useTaskMenu } from "../../components/task-menu/task-menu";
import { TaskMenuAction } from "../../components/task-menu/task-menu-types";
import { TaskFragment } from "../../graphql/fragmentTask.graphql";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import { UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";
import { taskPriorities } from "../../tasks-constants";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useRouter } from "next/navigation";
import { GetTasksQueryVariables } from "../../graphql/getTasks.graphql";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { updateTaskPath } from "../../tasks-route-helpers";
import { DefaultTaskStatusId } from "../../tasks-types";
import styles from "./board-tasks.module.css";

const CardProperty: FC<
  PropsWithChildren<
    {
      icon: Icon;
      iconColor?: string;
      label: string;
      onRemove?: () => void;
      canRemove?: boolean;
      applyCollapse?: boolean;
      isCollapsed?: boolean;
      isActivated?: boolean;
    } & GroupProps
  >
> = ({
  icon: Icon,
  iconColor,
  label,
  onRemove,
  canRemove,
  applyCollapse,
  isCollapsed,
  isActivated,
  ...props
}) => {
  const hover = useHover();
  const color = useColor();

  const icon = useMemo(() => {
    if (applyCollapse && isCollapsed) {
      return <IconCaretDownFilled size={18} />;
    }

    if (applyCollapse && !isCollapsed && hover.hovered) {
      return <IconCaretRightFilled size={18} />;
    }

    return <Icon strokeWidth={1.8} size={18} />;
  }, [applyCollapse, isCollapsed, hover.hovered]);

  return (
    <Group
      flex={1}
      w="100%"
      gap={3}
      {...props}
      className={styles.CardProperty}
      data-activated={isActivated}
    >
      <Group gap={5}>
        <ThemeIcon variant="transparent" color={color(iconColor || "gray")} size="xs">
          {icon}
        </ThemeIcon>
      </Group>

      <Group
        gap={5}
        flex={1}
        ref={hover.ref}
        p={4}
        style={{ borderRadius: 5 }}
        className={styles.CardPropertyContent}
      >
        <Group w="100%" mih={24} gap={3} flex={1}>
          {props.children}

          {!!onRemove && hover.hovered && canRemove && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray.4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove?.();
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Group>
  );
};

interface BoardTaskCardProps {
  task: TaskFragment;
  prevTask?: TaskFragment | null;
  nextTask?: TaskFragment | null;
  showStatus?: boolean;
  scrollContainerRef?: HTMLDivElement | null;
  groupVariables: GetTasksQueryVariables | null;
}

export const BoardTaskCard: FC<BoardTaskCardProps> = ({
  task,
  nextTask,
  prevTask,
  showStatus,
  scrollContainerRef,
  groupVariables,
}) => {
  const color = useColor();
  const router = useRouter();
  const taskMenu = useTaskMenu({ task, groupVariables });

  const { t } = useLingui();
  const { updateTasks } = useUpdateTasks();
  const { status } = useTaskStatuses(task);

  const droppableRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<HTMLDivElement | null>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const [isShowSubTasks, setIsShowSubTasks] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [over, setOver] = useState<{ edge: Edge; rect: DOMRect } | null>(null);

  const isOutdated = useMemo(
    () =>
      !!task?.dueDate &&
      task.dueDate < DateTime.getNowInSeconds() &&
      task.status !== DefaultTaskStatusId.CLOSED,
    [task],
  );

  const subtaskVariables: GetTasksQueryVariables = useMemo(() => {
    return {
      parentId: task._id,
    };
  }, [task._id]);

  const subtasks = useTasksQuery({
    variables: subtaskVariables,
    isSkipLoadCount: task.childCount === 0,
  });

  useEffect(() => {
    if (!draggingRef.current || !droppableRef.current) return;

    return combine(
      draggable({
        element: draggingRef.current,
        getInitialData: ({ element }) => ({
          task,
          rect: element.getBoundingClientRect(),
          groupVariables,
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
          return attachClosestEdge({ task }, { element, input, allowedEdges: ["top", "bottom"] });
        },
        onDragEnter({ source, self }) {
          const sourceTask = source.data.task as TaskFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setOver({ edge: closestEdge, rect: source.data.rect as DOMRect });
        },
        onDragLeave({ source }) {
          const sourceTask = source.data.task as TaskFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id) return;

          setOver(null);
        },
        onDrag({ source, self }) {
          const sourceTask = source.data.task as TaskFragment;
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

          const sourceTask = source.data.task as TaskFragment;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as GetTasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          if (closestEdge === "top") {
            const order = (task.order + (prevTask?.order ?? 0)) / 2;
            updateTasks([{ _id: sourceTask._id, order, status: task.status, context }]);
          }

          if (closestEdge === "bottom") {
            const order = (task.order + (nextTask?.order ?? task.order + 1)) / 2;
            updateTasks([{ _id: sourceTask._id, order, status: task.status, context }]);
          }
        },
      }),
    );
  }, [task, groupVariables]);

  useEffect(() => {
    if (isShowSubTasks) subtasks.getTasks();
  }, [subtasks.getTasks, isShowSubTasks]);

  const droppableShadow = useMemo(() => {
    if (!over) return null;

    return (
      <motion.div
        style={{ height: over.rect.height * 0.7 }}
        animate={{ height: over.rect.height, transition: { duration: 0.2 } }}
      >
        <Card bg="gray" opacity={0.2} shadow="xs" h="100%" />
      </motion.div>
    );
  }, [over]);

  if (!task) return null;

  return (
    <Fragment>
      <Stack ref={droppableRef} gap={10} opacity={isDragging ? 0.5 : 1} pos="relative">
        {over && over.edge === "top" && droppableShadow}

        <Card shadow="xs" p={10} className={styles.BoardCard}>
          <Stack gap={5} ref={draggingRef}>
            <Stack
              gap={5}
              style={{ cursor: "grab", color: "unset", textDecoration: "none" }}
              onClick={(e) => {
                const openNewTab = e.altKey || e.ctrlKey || e.metaKey;
                if (openNewTab) {
                  window.open(updateTaskPath({ code: task.code }), "_blank");
                } else {
                  router.push(updateTaskPath({ code: task.code }));
                }
              }}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group flex={1} gap={5}>
                  <Badge fz={10} color="gray" size="xs" variant="outline">
                    {renderEntityCode(task.code)}
                  </Badge>

                  {task.folder && (
                    <Badge fz={10} color={task.folder.color ?? "gray"} size="xs" variant="outline">
                      {task.folder.name}
                    </Badge>
                  )}
                </Group>
              </Group>

              <Tooltip label={task.name} disabled={task.name.length < 60} maw="70dvw" multiline>
                <Stack style={{ cursor: "pointer" }}>
                  <Text fz={14} fw={500} lineClamp={2}>
                    {task.name}
                  </Text>
                </Stack>
              </Tooltip>
            </Stack>

            <Stack gap={0}>
              {showStatus && (
                <CardProperty
                  icon={IconPlaystationCircle}
                  iconColor={color(status.color ?? "gray")}
                  isActivated={taskMenu.activatedAction === TaskMenuAction.CHANGE_STATUS}
                  label={t`Status`}
                  onClick={(e) => {
                    taskMenu.open({
                      action: TaskMenuAction.CHANGE_STATUS,
                      target: e.currentTarget,
                      options: {
                        offset: { x: 10 },
                      },
                    });
                  }}
                >
                  <Text fz={13} fw={500} c={color(status.color ?? "gray")}>
                    {status.name}
                  </Text>
                </CardProperty>
              )}

              <CardProperty
                icon={IconTags}
                label={t`Tags`}
                isActivated={taskMenu.activatedAction === TaskMenuAction.CHANGE_TAGS}
                onClick={(e) => {
                  taskMenu.open({
                    action: TaskMenuAction.CHANGE_TAGS,
                    target: e.currentTarget,
                    options: {
                      offset: { x: 10 },
                    },
                  });
                }}
              >
                {task.tags.length ? (
                  task.tags.map((tag) => (
                    <Badge
                      className="clickable"
                      color={tag.color || "gray"}
                      key={tag._id}
                      size="xs"
                      variant="light"
                    >
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <Group color="gray" variant="subtle" fz={12} c="gray" gap={2}>
                    <IconPlus size={14} strokeWidth={1.5} />
                    <Trans>Add tag</Trans>
                  </Group>
                )}
              </CardProperty>

              <CardProperty
                icon={IconCalendar}
                onRemove={() => updateTasks([{ ...task, dueDate: null, startDate: null }])}
                canRemove={!!task.dueDate || !!task.startDate}
                isActivated={taskMenu.activatedAction === TaskMenuAction.CHANGE_TIMELINE}
                onClick={(e) => {
                  taskMenu.open({
                    action: TaskMenuAction.CHANGE_TIMELINE,
                    target: e.currentTarget,
                    options: {
                      offset: { x: 10 },
                    },
                  });
                }}
                label={t`Due date`}
              >
                {task.dueDate ? (
                  <Text
                    flex={1}
                    fz={14}
                    fw={500}
                    c={isOutdated ? "red" : "var(--mantine-color-text)"}
                  >
                    <DateFormat value={task.dueDate} />
                  </Text>
                ) : (
                  <Group color="gray" variant="subtle" fz={12} c="gray" gap={2}>
                    <IconPlus size={14} strokeWidth={1.5} />
                    <Trans>Add due date</Trans>
                  </Group>
                )}
              </CardProperty>

              <CardProperty
                icon={task.priority ? IconFlagFilled : IconFlag}
                iconColor={task.priority ? taskPriorities[task.priority]?.color : undefined}
                label={t`Priority`}
                canRemove={!!task.priority}
                onRemove={() => updateTasks([{ _id: task._id, priority: null }])}
                isActivated={taskMenu.activatedAction === TaskMenuAction.CHANGE_PRIORITY}
                onClick={(e) => {
                  taskMenu.open({
                    action: TaskMenuAction.CHANGE_PRIORITY,
                    target: e.currentTarget,
                    options: {
                      offset: { x: 10 },
                    },
                  });
                }}
              >
                {task.priority ? (
                  <Text flex={1} fz={14} fw={500} c={taskPriorities[task.priority]?.color}>
                    {t(taskPriorities[task.priority]?.label)}
                  </Text>
                ) : (
                  <Group color="gray" variant="subtle" fz={12} c="gray" gap={2}>
                    <IconPlus size={14} strokeWidth={1.5} />
                    <Trans>Add priority</Trans>
                  </Group>
                )}
              </CardProperty>

              <CardProperty
                icon={IconUser}
                label={t`Assignee`}
                isActivated={taskMenu.activatedAction === TaskMenuAction.CHANGE_ASSIGNEE}
                onClick={(e) => {
                  taskMenu.open({
                    action: TaskMenuAction.CHANGE_ASSIGNEE,
                    target: e.currentTarget,
                    options: {
                      offset: { x: 10 },
                    },
                  });
                }}
              >
                {task.assigneeUsers.length > 0 ? (
                  task.assigneeUsers.map((member) => (
                    <Avatar key={member._id} size={22} user={member} hideOnlineStatus />
                  ))
                ) : (
                  <Group color="gray" variant="subtle" fz={12} c="gray" gap={2}>
                    <IconPlus size={14} strokeWidth={1.5} />
                    <Trans>Add assignee</Trans>
                  </Group>
                )}
              </CardProperty>

              {task.childCount > 0 && (
                <CardProperty
                  icon={IconSubtask}
                  label={t`Subtasks`}
                  applyCollapse
                  isCollapsed={isShowSubTasks}
                  onClick={() => setIsShowSubTasks((s) => !s)}
                >
                  <Group justify="space-between" gap={8} flex={1}>
                    <Text fz="sm">
                      <Plural value={task.childCount} one="# subtask" other="# subtasks" />
                    </Text>

                    {task.childProgress && (
                      <Group flex={1} justify="end" gap={5}>
                        <Text fz={10}>
                          <NumberFormat value={task.childProgress} suffix="%" />
                        </Text>
                        <Progress value={task.childProgress} w={60} color={"dark"} />
                      </Group>
                    )}
                  </Group>
                </CardProperty>
              )}
            </Stack>
          </Stack>
        </Card>

        {over && over.edge === "bottom" && droppableShadow}
      </Stack>

      {isShowSubTasks && (
        <Fragment>
          {subtasks.tasks.length > 0 && (
            <Stack gap={10} pl={20}>
              {subtasks.tasks.map((subTask, subTaskIndex) => (
                <BoardTaskCard
                  key={subTask._id}
                  task={subTask}
                  showStatus
                  prevTask={subtasks.tasks[subTaskIndex - 1]}
                  nextTask={subtasks.tasks[subTaskIndex + 1]}
                  groupVariables={subtaskVariables}
                />
              ))}
            </Stack>
          )}

          {(subtasks.loading || subtasks.isLoadingMore) && (
            <Stack gap={10} pl={20}>
              <Skeleton height={200} />
            </Stack>
          )}

          {subtasks.isCanLoadMore && (
            <WayPoint scrollContainerRef={scrollContainerRef} onReached={subtasks.loadMore} />
          )}
        </Fragment>
      )}

      {isDragging && draggingRefContainer.current && (
        <Portal target={draggingRefContainer.current}>
          <Card
            shadow="xs"
            p={10}
            style={{ width: draggingRef.current?.getBoundingClientRect().width }}
          >
            <Stack gap={2}>
              <Group flex={1} gap={5}>
                <Badge fz={10} color="gray" size="xs" variant="outline">
                  {renderEntityCode(task.code)}
                </Badge>

                {task.folder && (
                  <Badge fz={10} color={task.folder.color || "gray"} size="xs" variant="outline">
                    {task.folder.name}
                  </Badge>
                )}
              </Group>

              <Text fz="sm" fw={500} lineClamp={2}>
                {task.name}
              </Text>
            </Stack>
          </Card>
        </Portal>
      )}
    </Fragment>
  );
};
