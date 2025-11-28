"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagType } from "@/modules/tags/tags-types";
import { TaskPrioritySelector } from "@/modules/tasks/components/task-priority-selector";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import {
  getTaskPriorityColor,
  renderTaskStatusStyle,
  updateTasks,
} from "@/modules/tasks/tasks-service";
import { TaskEntity, TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { renderEntityCode } from "@/modules/workspaces/utils";
import {
  attachClosestEdge,
  type Edge,
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
  em,
  Group,
  Menu,
  Portal,
  Progress,
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
import { taskPriorities } from "../../task-constants";

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
  id: string;
  prevTask?: TaskEntity | null;
  nextTask?: TaskEntity | null;
  showStatus?: boolean;
}

export const BoardTaskCard: FC<BoardTaskCardProps> = (props) => {
  const tasks = useTasks();

  const droppableRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<HTMLDivElement | null>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const [task, taskHandler] = useTask(props.id);
  const [isShowSubTasks, setIsShowSubTasks] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [over, setOver] = useState<{ edge: Edge; rect: DOMRect } | null>(null);

  useEffect(() => {
    if (!draggingRef.current || !droppableRef.current || !task) return;

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
          const sourceTask = source.data.task as TaskEntity;
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

          const sourceTask = source.data.task as TaskEntity;
          if (!sourceTask) return;
          if (sourceTask._id === task._id || sourceTask._id === task.parentId) return;

          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          if (closestEdge === "top") {
            const order = (task.order + (props.prevTask?.order ?? 0)) / 2;
            updateTasks([
              { _id: sourceTask._id, order, status: task.status, parentId: task.parentId },
            ]);
          }

          if (closestEdge === "bottom") {
            const order = (task.order + (props.nextTask?.order ?? 0.5)) / 2;
            updateTasks([
              { _id: sourceTask._id, order, status: task.status, parentId: task.parentId },
            ]);
          }
        },
      })
    );
  }, [task]);

  const cardShadow = useMemo(() => {
    if (over) {
      return (
        <motion.div
          style={{ height: 0 }}
          animate={{ height: over.rect.height, transition: { duration: 0.2 } }}
        >
          <Card bg="gray" opacity={0.2} shadow="xs" h="100%" />
        </motion.div>
      );
    }

    return undefined;
  }, [over]);

  if (!task) return null;

  const taskStatusStyle = renderTaskStatusStyle(task.status, tasks.statuses);
  const goDetail = () => tasks.open(task);

  return (
    <Fragment>
      <Stack ref={droppableRef} gap={10} opacity={isDragging ? 0.5 : 1} pos="relative">
        {over && over.edge === "top" && cardShadow}

        <Card shadow="xs" p={10}>
          <Stack gap={5} ref={draggingRef}>
            <Stack gap={2} style={{ cursor: "grab" }}>
              <Group onClick={goDetail} justify="space-between" align="center" wrap="nowrap">
                <Group flex={1} gap={5}>
                  <Badge fz={10} color="gray" size="xs" variant="outline">
                    {renderEntityCode(task.code)}
                  </Badge>

                  {taskHandler.tagFolder && !tasks.tagFolder && (
                    <Badge
                      fz={10}
                      color={taskHandler.tagFolder.color || "gray"}
                      size="xs"
                      variant="outline"
                    >
                      {taskHandler.tagFolder.name}
                    </Badge>
                  )}
                </Group>

                <Group gap={0} wrap="nowrap">
                  {!task.parentId && (
                    <Tooltip label={t`Create subtask`}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          OnModalCreateTask({
                            parentId: task._id,
                            onClose: () => setIsShowSubTasks(true),
                          });
                        }}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}

                  {taskHandler.isAbleToNextStatus && !props.showStatus && (
                    <Tooltip label={t`Next status`}>
                      <ActionIcon
                        variant="subtle"
                        color={taskStatusStyle.color}
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          return taskHandler.nextStatus();
                        }}
                      >
                        <IconCaretRightFilled size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>

              <Tooltip label={task.name} disabled={task.name.length < 60} maw="70dvw" multiline>
                <Stack style={{ cursor: "pointer" }} onClick={goDetail}>
                  <Text fz="sm" fw={500} lineClamp={2}>
                    {task.name}
                  </Text>
                </Stack>
              </Tooltip>
            </Stack>

            <Stack gap={0}>
              {props.showStatus && (
                <CtaSection icon={IconPlaystationCircle} label={t`Status`}>
                  <Group gap={0}>
                    <TaskStatusOptions
                      task={task}
                      target={
                        <Group gap={5}>
                          <Button
                            color={taskStatusStyle.color}
                            variant="subtle"
                            size="compact-sm"
                            fz={em(14)}
                          >
                            {taskStatusStyle.name}
                          </Button>
                        </Group>
                      }
                      onSelect={(s) => taskHandler.onUpdate({ ...task, status: s })}
                    />

                    {taskHandler.isAbleToNextStatus && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color={taskStatusStyle.color}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          return taskHandler.nextStatus();
                        }}
                      >
                        <IconCaretRightFilled size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </CtaSection>
              )}

              <TagSelector
                type={TagType.TASK}
                onSelect={(t) => {
                  if (!t) return;
                  taskHandler.onUpdate({ ...task, tagIds: [...(task.tagIds || []), t._id] });
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
                        {taskHandler.tags.length ? (
                          taskHandler.tags.map((tag) => (
                            <TaskTag key={tag._id} id={tag._id} h={26} />
                          ))
                        ) : (
                          <Button
                            color="gray"
                            variant="subtle"
                            leftIcon={IconPlus}
                            iconSpacing={-12}
                            iconSize={16}
                            size="compact-sm"
                            fz={13}
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
                onRemove={() => taskHandler.onUpdate({ ...task, dueDate: null, startDate: null })}
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
                              c={
                                taskHandler.isOutdated ? "red" : "var(--mantine-primary-color-text)"
                              }
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
                            iconSpacing={-12}
                            iconSize={16}
                            size="compact-sm"
                            fz={13}
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
                        taskHandler.onUpdate({ ...task, ...e });
                      }}
                    />
                  </Menu.Dropdown>
                </Menu>
              </CtaSection>

              <TaskPrioritySelector
                onSelect={(priority) => taskHandler.onUpdate({ ...task, priority })}
                render={(selector) => {
                  return (
                    <CtaSection
                      icon={task.priority ? IconFlagFilled : IconFlag}
                      iconColor={task.priority ? getTaskPriorityColor(task.priority) : undefined}
                      label={t`Priority`}
                      canRemove={!!task.priority}
                      onRemove={() => taskHandler.onUpdate({ ...task, priority: null })}
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
                              iconSpacing={-12}
                              iconSize={16}
                              size="compact-sm"
                              fz={13}
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
                    taskHandler.onUpdate({ ...task, assigneeUserIds: users.map((v) => v.userId) });
                  }}
                />
              </CtaSection>

              {taskHandler.subTasks.length > 0 && (
                <CtaSection
                  icon={IconSubtask}
                  label={t`Subtasks`}
                  applyCollapse
                  isCollapsed={isShowSubTasks}
                >
                  <Group justify="space-between" gap={5} flex={1}>
                    <Button
                      fz={em(14)}
                      size="compact-xs"
                      color="gray.8"
                      variant="subtle"
                      onClick={() => setIsShowSubTasks((s) => !s)}
                    >
                      <NumberFormat value={taskHandler.subTasks.length} /> <Trans>subtasks</Trans>
                    </Button>
                    <Group flex={1} justify="end" gap={5}>
                      <Text fz={em(10)}>
                        <NumberFormat value={taskHandler.progress.percent} suffix="%" />
                      </Text>
                      <Progress
                        value={taskHandler.progress.percent}
                        w={60}
                        color={taskHandler.progress.status.color || "dark"}
                      />
                    </Group>
                  </Group>
                </CtaSection>
              )}
            </Stack>
          </Stack>
        </Card>

        {over && over.edge === "bottom" && cardShadow}
      </Stack>

      {taskHandler.subTasks.length > 0 && isShowSubTasks && (
        <Stack gap={10} pl={20}>
          {taskHandler.subTasks.map((subTask, subTaskIndex) => (
            <BoardTaskCard
              key={subTask._id}
              id={subTask._id}
              showStatus
              prevTask={taskHandler.subTasks[subTaskIndex - 1]}
              nextTask={taskHandler.subTasks[subTaskIndex + 1]}
            />
          ))}
        </Stack>
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

                {taskHandler.tagFolder && !tasks.tagFolder && (
                  <Badge
                    fz={10}
                    color={taskHandler.tagFolder.color || "gray"}
                    size="xs"
                    variant="outline"
                  >
                    {taskHandler.tagFolder.name}
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
