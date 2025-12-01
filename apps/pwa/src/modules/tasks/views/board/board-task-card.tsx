"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { WayPoint } from "@/components/way-point";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagType } from "@/modules/tags/tags-types";
import { TaskPrioritySelector } from "@/modules/tasks/components/task-priority-selector";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { useTasks } from "@/modules/tasks/tasks-context";
import {
  getTaskPriorityColor,
  isTaskOutdated,
  renderTaskStatusStyle,
} from "@/modules/tasks/tasks-service";
import { TaskEntity, TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { onError } from "@/utils/exceptions.utils";
import { useQuery } from "@apollo/client/react";
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
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Menu,
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
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../queries/queryTasks.graphql";
import { taskPriorities } from "../../task-constants";

type Task = TasksQuery["tasks"]["data"][number];

const CtaSection: FC<
  PropsWithChildren<{
    icon: Icon;
    iconColor?: string;
    label: string;
    onRemove?: () => void;
    canRemove?: boolean;
    applyCollapse?: boolean;
    isCollapsed?: boolean;
    onClick?: () => void;
  }>
> = (props) => {
  const hover = useHover();
  const color = useColor();

  const icon = useMemo(() => {
    if (props.applyCollapse && props.isCollapsed) {
      return <IconCaretDownFilled size={16} />;
    }

    if (props.applyCollapse && !props.isCollapsed && hover.hovered) {
      return <IconCaretRightFilled size={16} />;
    }

    return <props.icon strokeWidth={1.8} />;
  }, [props.applyCollapse, props.isCollapsed, hover.hovered]);

  return (
    <Tooltip label={props.label} disabled position="left">
      <Group flex={1} w="100%" gap={0} onClick={props.onClick}>
        <Group gap={5}>
          <ThemeIcon variant="transparent" color={color(props.iconColor || "gray")} size="xs">
            {icon}
          </ThemeIcon>
        </Group>

        <Group gap={5} flex={1} ref={hover.ref} p={4} style={{ borderRadius: 5 }}>
          <Group justify="space-between" w="100%">
            {props.children}

            {!!props.onRemove && hover.hovered && props.canRemove && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.onRemove?.();
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Group>
    </Tooltip>
  );
};

interface BoardTaskCardProps {
  task: Task;
  prevTask?: Task | null;
  nextTask?: Task | null;
  showStatus?: boolean;
  scrollContainerRef?: HTMLDivElement | null;
}

export const BoardTaskCard: FC<BoardTaskCardProps> = ({
  task,
  nextTask,
  prevTask,
  showStatus,
  scrollContainerRef,
}) => {
  const tasks = useTasks();
  const { updateTasks } = useUpdateTasks();

  const droppableRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<HTMLDivElement | null>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const [isShowSubTasks, setIsShowSubTasks] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [over, setOver] = useState<{ edge: Edge; rect: DOMRect } | null>(null);
  const [isFetchingMoreChildTasks, setIsFetchingMoreChildTasks] = useState(false);

  const childTasksVariables: TasksQueryVariables = useMemo(() => {
    return {
      parentId: task._id,
    };
  }, [task._id]);

  const childTasks = useQuery<TasksQuery, TasksQueryVariables>(QUERY_TASKS, {
    skip: !isShowSubTasks,
    variables: childTasksVariables,
  });

  const onFetchMoreChildTasks = async () => {
    setIsFetchingMoreChildTasks(true);
    await childTasks
      .fetchMore({
        variables: {
          ...childTasksVariables,
          offset: childTasks.data?.tasks.data.length || 0,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              data: [...prev.tasks.data, ...fetchMoreResult.tasks.data],
            },
          };
        },
      })
      .catch(onError)
      .finally(() => setIsFetchingMoreChildTasks(false));
  };

  const isCanFetchMoreChildTasks = useMemo(() => {
    return childTasks.data && childTasks.data?.tasks.data.length < childTasks.data?.tasks.count;
  }, [childTasks.data]);

  useEffect(() => {
    if (!draggingRef.current || !droppableRef.current) return;

    return combine(
      draggable({
        element: draggingRef.current,
        getInitialData: ({ element }) => ({
          task,
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
          return attachClosestEdge({ task }, { element, input, allowedEdges: ["top", "bottom"] });
        },
        onDragEnter({ source, self }) {
          const sourceTask = source.data.task as TaskEntity;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setOver({ edge: closestEdge, rect: source.data.rect as DOMRect });
        },
        onDragLeave({ source }) {
          const sourceTask = source.data.task as TaskEntity;
          if (!sourceTask) return;
          if (sourceTask._id === task._id) return;

          setOver(null);
        },
        onDrag({ source, self }) {
          const sourceTask = source.data.task as Task;
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

          const sourceTask = source.data.task as Task;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          if (closestEdge === "top") {
            const order = (task.order + (prevTask?.order ?? 0)) / 2;
            updateTasks([{ _id: sourceTask._id, order, status: task.status }]);
          }

          if (closestEdge === "bottom") {
            const order = (task.order + (nextTask?.order ?? 0.5)) / 2;
            updateTasks([{ _id: sourceTask._id, order, status: task.status }]);
          }
        },
      })
    );
  }, [task]);

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

  const taskStatusStyle = renderTaskStatusStyle(task.status, tasks.statuses);

  return (
    <Fragment>
      <Stack ref={droppableRef} gap={10} opacity={isDragging ? 0.5 : 1} pos="relative">
        {over && over.edge === "top" && droppableShadow}

        <Card shadow="xs" p={10}>
          <Stack gap={5} ref={draggingRef}>
            <Stack
              gap={2}
              style={{ cursor: "grab", color: "unset", textDecoration: "none" }}
              onClick={(e) => {
                const openNewTab = e.altKey || e.ctrlKey || e.metaKey;
                if (openNewTab) window.open(tasks.href(task), "_blank");
                else tasks.open(task);
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
                  <Text fz="sm" fw={500} lineClamp={2}>
                    {task.name}
                  </Text>
                </Stack>
              </Tooltip>
            </Stack>

            <Stack gap={0}>
              {showStatus && (
                <CtaSection icon={IconPlaystationCircle} label={t`Status`}>
                  <Group gap={0}>
                    <TaskStatusOptions
                      task={task}
                      target={
                        <Button color={taskStatusStyle.color} variant="subtle" size="compact-sm">
                          {taskStatusStyle.name}
                        </Button>
                      }
                      onSelect={(s) => updateTasks([{ ...task, status: s }])}
                    />
                  </Group>
                </CtaSection>
              )}

              <TagSelector
                type={TagType.TASK}
                onSelect={(t) => {
                  if (!t) return;
                  updateTasks([{ ...task, tags: [...(task.tags || []), t as any] }]);
                }}
                target={(selector) => {
                  return (
                    <CtaSection icon={IconTags} label={t`Tags`} onClick={selector.toggle}>
                      <Group
                        gap={3}
                        flex={1}
                        style={{ cursor: "pointer" }}
                        className="unselectable"
                      >
                        {task.tags.length ? (
                          task.tags.map((tag) => <TaskTag key={tag._id} id={tag._id} h={26} />)
                        ) : (
                          <Button
                            color="gray"
                            variant="subtle"
                            leftIcon={IconPlus}
                            size="compact-xs"
                            fw={400}
                          >
                            <Trans>Add tag</Trans>
                          </Button>
                        )}
                      </Group>
                    </CtaSection>
                  );
                }}
              />

              <CtaSection
                icon={IconCalendar}
                onRemove={() => updateTasks([{ ...task, dueDate: null, startDate: null }])}
                canRemove={!!task.dueDate || !!task.startDate}
                label={t`Due date`}
              >
                <Menu shadow="xs">
                  <Menu.Target>
                    <Group style={{ cursor: "pointer" }} flex={1}>
                      {(function () {
                        if (task.dueDate) {
                          return (
                            <Text
                              c={isTaskOutdated(task) ? "red" : "var(--mantine-primary-color-text)"}
                            >
                              <DateFormat value={task.dueDate} type="date" />
                            </Text>
                          );
                        }

                        return (
                          <Button
                            color="gray"
                            variant="subtle"
                            leftIcon={IconPlus}
                            size="compact-xs"
                            fw={400}
                          >
                            <Trans>Add due date</Trans>
                          </Button>
                        );
                      })()}
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <DueDateInput
                      p={5}
                      startDate={task.startDate}
                      dueDate={task.dueDate}
                      onChange={(e) => {
                        updateTasks([{ _id: task._id, ...e }]);
                      }}
                    />
                  </Menu.Dropdown>
                </Menu>
              </CtaSection>

              <TaskPrioritySelector
                onSelect={(priority) => updateTasks([{ _id: task._id, priority }])}
                render={(selector) => {
                  return (
                    <CtaSection
                      icon={task.priority ? IconFlagFilled : IconFlag}
                      iconColor={task.priority ? getTaskPriorityColor(task.priority) : undefined}
                      label={t`Priority`}
                      canRemove={!!task.priority}
                      onRemove={() => updateTasks([{ _id: task._id, priority: null }])}
                      onClick={selector.toggle}
                    >
                      <Group style={{ cursor: "pointer" }} flex={1}>
                        {(function () {
                          if (task.priority) {
                            return (
                              <Group gap={1}>
                                <Text>
                                  {taskPriorities[task.priority as TaskPriority]?.label()}
                                </Text>
                              </Group>
                            );
                          }

                          return (
                            <Button
                              color="gray"
                              variant="subtle"
                              leftIcon={IconPlus}
                              size="compact-xs"
                              fw={400}
                            >
                              <Trans>Add priority</Trans>
                            </Button>
                          );
                        })()}
                      </Group>
                    </CtaSection>
                  );
                }}
              />

              <CtaSection icon={IconUser} label={t`Assignee`}>
                <WorkspaceMembersInput
                  collapsed
                  value={task.assigneeUsers}
                  onChange={(users) => {
                    updateTasks([{ _id: task._id, assigneeUsers: users as any }]);
                  }}
                />
              </CtaSection>

              {task.childCount > 0 && (
                <CtaSection
                  icon={IconSubtask}
                  label={t`Subtasks`}
                  applyCollapse
                  isCollapsed={isShowSubTasks}
                >
                  <Group justify="space-between" gap={5} flex={1}>
                    <Button
                      size="compact-xs"
                      fw={400}
                      color="gray.8"
                      variant="subtle"
                      onClick={() => setIsShowSubTasks((s) => !s)}
                    >
                      <NumberFormat value={task.childCount} /> <Trans>subtasks</Trans>
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
                </CtaSection>
              )}
            </Stack>
          </Stack>
        </Card>

        {over && over.edge === "bottom" && droppableShadow}
      </Stack>

      {isShowSubTasks && (
        <Fragment>
          {childTasks.data && childTasks.data?.tasks.data.length > 0 && (
            <Stack gap={10} pl={20}>
              {childTasks.data?.tasks.data.map((subTask, subTaskIndex) => (
                <BoardTaskCard
                  key={subTask._id}
                  task={subTask}
                  showStatus
                  prevTask={childTasks.data?.tasks.data[subTaskIndex - 1]}
                  nextTask={childTasks.data?.tasks.data[subTaskIndex + 1]}
                />
              ))}
            </Stack>
          )}

          {(childTasks.loading || isFetchingMoreChildTasks) && (
            <Stack gap={10} pl={20}>
              <Skeleton height={200} />
            </Stack>
          )}

          <WayPoint
            scrollContainerRef={scrollContainerRef}
            enabled={isCanFetchMoreChildTasks}
            onReached={onFetchMoreChildTasks}
          />
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
