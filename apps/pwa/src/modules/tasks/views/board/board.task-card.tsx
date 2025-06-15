"use client";

import { Button } from "@/components/buttons/button";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { UsersInput } from "@/components/inputs/users-input";
import { TagSelector } from "@/modules/tags/tag-selector";
import { TaskPrioritySelector } from "@/modules/tasks/components/task-priority-selector";
import { num, renderDateTime, t } from "@/modules/lang/lang-service";
import { TagType } from "@/modules/tags/tags-types";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskPriorityColor, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { ReorderTaskPotision, TaskEntity } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { capitalize } from "@/utils/string.utils";
import {
  ActionIcon,
  Badge,
  Card,
  em,
  Group,
  Menu,
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
import { FC, Fragment, PropsWithChildren, useState } from "react";
import { getTaskDragId, useDndTasks, useTaskDrag, useTaskDrop } from "../../tasks-dnd-provider";

interface BoardTaskCardProps {
  id: string;
  overlay?: boolean;
  showStatus?: boolean;

  indexType?: "first" | "last";
  nextId?: string;
  prevId?: string;
}

export const BoardTaskCard: FC<BoardTaskCardProps> = (props) => {
  const tasks = useTasks();

  const [task, ctx] = useTask(props.id);
  const [isShowSubTasks, setIsShowSubTasks] = useState(false);

  const dndTasks = useDndTasks();
  const { draggingTaskId } = dndTasks;

  if (!task) return null;

  const taskStatusStyle = renderTaskStatusStyle(task.status, tasks.statuses);
  const draggableId = getTaskDragId(task._id, "card");

  const isSelfDragging = draggingTaskId === props.id;
  const isHasChild = ctx.subTasks.length > 0 || task.childCount > 0;
  const isParentDragging = draggingTaskId === task.parentId;

  const goDetail = () => tasks.open(task);

  const render = (overlay: boolean) => {
    if (overlay)
      return (_props: PropsWithChildren) => (
        <Stack gap={5}>
          <Card
            shadow="xs"
            p={10}
            flex={1}
            style={{
              transform: `rotate(-2deg)`,
            }}
            role="dialog"
            tabIndex={-1}
          >
            {_props.children}
          </Card>
        </Stack>
      );

    return (_props: PropsWithChildren) => {
      const taskDrag = useTaskDrag(task._id, "card");

      return (
        <Fragment>
          <BoardCardDroppable
            visible={!isSelfDragging && !isParentDragging && props.prevId !== draggingTaskId}
            targetTask={task}
            position={ReorderTaskPotision.BEFORE}
            status={task.status}
          />

          <Stack
            opacity={taskDrag.isDragging ? 0.5 : 1}
            gap={5}
            style={{ position: "relative", zIndex: 1 }}
          >
            <Card
              shadow="xs"
              p={10}
              flex={1}
              ref={taskDrag.setNodeRef}
              {...taskDrag.attributes}
              {...taskDrag.listeners}
              role="dialog"
              tabIndex={-1}
            >
              {_props.children}
            </Card>
          </Stack>

          <BoardCardDroppable
            visible={
              !isSelfDragging && !isParentDragging && props.indexType === "last" && !isHasChild
            }
            targetTask={task}
            position={ReorderTaskPotision.AFTER}
            status={task.status}
            isSubTask
          />
        </Fragment>
      );
    };
  };

  const Wrapper = render(!!props.overlay);

  return (
    <Stack flex={1} gap={10} style={{ position: "relative" }}>
      <Wrapper>
        <Stack gap={5}>
          <Stack gap={2} id={draggableId} style={{ cursor: props.overlay ? "grabbing" : "grab" }}>
            <Group onClick={goDetail} justify="space-between" align="center" wrap="nowrap">
              <Group flex={1} gap={5}>
                <Badge fz={em(10)} color="gray" size="xs" variant="outline">
                  {renderEntityCode(task.code)}
                </Badge>

                {ctx.tagFolder && !tasks.tagFolder && (
                  <Badge
                    fz={em(10)}
                    color={ctx.tagFolder.color || "gray"}
                    size="xs"
                    variant="outline"
                  >
                    {ctx.tagFolder.name}
                  </Badge>
                )}
              </Group>

              <Group gap={0} wrap="nowrap">
                {!task.parentId && (
                  <Tooltip label={t("create_sub_task")}>
                    <ActionIcon
                      variant="subtle"
                      color="gray.6"
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

                {ctx.isAbleToNextStatus && !props.showStatus && (
                  <Tooltip label={t("next_status")}>
                    <ActionIcon
                      variant="subtle"
                      color={taskStatusStyle.color}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return ctx.nextStatus();
                      }}
                    >
                      <IconCaretRightFilled size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>

            <Stack style={{ cursor: "pointer" }} onClick={goDetail} gap={5}>
              <Text fz={em(15)} fw={500}>
                {task.name}
              </Text>

              {/* <Renderer visible={!!ctx.tags.length}>
                <Group gap={3} wrap='nowrap'>
                  {ctx.tags.map(tag => <TaskTag
                    key={tag._id}
                    id={tag._id}
                    h={26}
                  />)}
                </Group>
              </Renderer> */}
            </Stack>
          </Stack>

          {!props.overlay && (
            <Stack gap={0}>
              {props.showStatus && (
                <CtaSection icon={IconPlaystationCircle} label={t("status")}>
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
                      onSelect={(s) => ctx.onUpdate({ ...task, status: s })}
                    />

                    {ctx.isAbleToNextStatus && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color={taskStatusStyle.color}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          return ctx.nextStatus();
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
                  ctx.onUpdate({ ...task, tagIds: [...(task.tagIds || []), t._id] });
                }}
                render={(selector) => {
                  return (
                    <CtaSection icon={IconTags} label={t("tags")} onClick={selector.toggle}>
                      <Group
                        gap={3}
                        flex={1}
                        style={{ cursor: "pointer" }}
                        className="unselectable"
                      >
                        {ctx.tags.length ? (
                          ctx.tags.map((tag) => <TaskTag key={tag._id} id={tag._id} h={26} />)
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
                            {capitalize(`${t("add")} ${t("tag")}`)}
                          </Button>
                        )}
                      </Group>
                    </CtaSection>
                  );
                }}
              />

              <CtaSection
                icon={IconCalendar}
                onRemove={() => ctx.onUpdate({ ...task, dueDate: null, startDate: null })}
                canRemove={!!task.dueDate || !!task.startDate}
                label={t("due_date")}
              >
                <Menu shadow="xs">
                  <Menu.Target>
                    <Group style={{ cursor: "pointer" }} flex={1}>
                      {(function () {
                        if (task.dueDate) {
                          return (
                            <Text c={ctx.isOutdated ? "red" : "var(--mantine-primary-color-text)"}>
                              {renderDateTime(task.dueDate, true)}
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
                            {t("add_due_date")}
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
                        ctx.onUpdate({ ...task, ...e });
                      }}
                    />
                  </Menu.Dropdown>
                </Menu>
              </CtaSection>

              <TaskPrioritySelector
                onSelect={(priority) => ctx.onUpdate({ ...task, priority })}
                render={(selector) => {
                  return (
                    <CtaSection
                      icon={task.priority ? IconFlagFilled : IconFlag}
                      iconColor={task.priority ? getTaskPriorityColor(task.priority) : undefined}
                      label={t("priority")}
                      canRemove={!!task.priority}
                      onRemove={() => ctx.onUpdate({ ...task, priority: null })}
                      onClick={selector.toggle}
                    >
                      <Group style={{ cursor: "pointer" }} flex={1}>
                        {(function () {
                          if (task.priority) {
                            return (
                              <Group gap={1}>
                                <Text>{t(`task_priority_${task.priority}`)}</Text>
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
                              {t("add_priority")}
                            </Button>
                          );
                        })()}
                      </Group>
                    </CtaSection>
                  );
                }}
              />

              <CtaSection icon={IconUser} label={t("assignee")}>
                <UsersInput
                  collapsed
                  value={task.assigneeUsers}
                  onChange={(users) => {
                    ctx.onUpdate({ ...task, assigneeUserIds: users.map((v) => v.userId) });
                  }}
                />
              </CtaSection>

              {ctx.subTasks.length > 0 && (
                <CtaSection
                  icon={IconSubtask}
                  label={t("subtasks")}
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
                      {t("subtasks_count", { count: num(ctx.subTasks.length) })}
                    </Button>
                    <Group flex={1} justify="end" gap={5}>
                      <Text fz={em(10)}>{num(ctx.progress.percent, { roundPrecision: 0 })}%</Text>
                      <Progress
                        value={ctx.progress.percent}
                        w={60}
                        color={ctx.progress.status.color || "dark"}
                      />
                    </Group>
                  </Group>
                </CtaSection>
              )}
            </Stack>
          )}
        </Stack>
      </Wrapper>

      {ctx.subTasks.length > 0 && isShowSubTasks && !props.overlay && (
        <Stack gap={10} pl={20}>
          {ctx.subTasks.map((subTask, index) => (
            <BoardTaskCard
              key={subTask._id}
              id={subTask._id}
              showStatus
              indexType={
                index === ctx.subTasks.length - 1 ? "last" : index === 0 ? "first" : undefined
              }
              nextId={ctx.subTasks[index + 1]?._id}
              prevId={ctx.subTasks[index - 1]?._id}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

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

  return (
    <Tooltip label={props.label} disabled position="left">
      <Group flex={1} w="100%" gap={0} onClick={props.onClick}>
        <Group gap={5}>
          <ThemeIcon variant="transparent" color={color(props.iconColor || "gray")} size="sm">
            {(function () {
              if (props.applyCollapse && props.isCollapsed)
                return <IconCaretDownFilled size={16} />;
              if (props.applyCollapse && !props.isCollapsed && hover.hovered)
                return <IconCaretRightFilled size={16} />;
              return <props.icon strokeWidth={1.5} />;
            })()}
          </ThemeIcon>
        </Group>

        <Group gap={5} flex={1} ref={hover.ref} p={5} style={{ borderRadius: 5 }}>
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

export const BoardCardDroppable: FC<{
  targetTask: TaskEntity;
  position: ReorderTaskPotision;
  status?: string;
  isSubTask?: boolean;
  visible?: boolean;
}> = (props) => {
  const dndTasks = useDndTasks();

  const droppable = useTaskDrop(
    `${props.targetTask._id}-${props.position}-card-${props.isSubTask ? "sub" : "main"}`,
    {
      ...props,
      taskId: props.targetTask._id,
    }
  );

  if (!props.visible || !dndTasks.draggingTaskId) return null;

  return (
    <Card
      shadow="xs"
      bg="var(--mantine-color-body)"
      ref={droppable.setNodeRef}
      mb={props.position === ReorderTaskPotision.BEFORE ? (droppable.isOver ? 0 : -30) : undefined}
      mt={props.position === ReorderTaskPotision.AFTER ? (droppable.isOver ? 0 : -30) : undefined}
      h={droppable.isOver ? 200 : 30}
      opacity={droppable.isOver ? 0.5 : 0.1}
      style={{
        position: "relative",
        width: "100%",
        zIndex: 20,
        transition: "height 0.2s",
      }}
    />
  );
};

export const ChangeStatusDrop: FC<{
  statusId: string;
  visible?: boolean;
}> = (props) => {
  const droppable = useTaskDrop(`${props.statusId}-status`, {
    changeStatus: props.statusId,
    changeParentId: "root",
  });

  if (!props.visible) return null;

  return (
    <Card
      shadow="xs"
      p={droppable.isOver ? 8 : 0}
      ref={droppable.setNodeRef}
      bg="var(--mantine-color-body)"
      w="100%"
      h={droppable.isOver ? 200 : 50}
      opacity={droppable.isOver ? 0.6 : 0}
      style={{
        transition: "height 0.2s",
      }}
    />
  );
};
