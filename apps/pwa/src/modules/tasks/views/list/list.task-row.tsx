"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { DueDateInput } from "@/components/inputs/due-date-input";
import { Renderer } from "@/components/renderer";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagType } from "@/modules/tags/tags-types";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskEntity } from "@/modules/tasks/tasks-service";
import { ReorderTaskPotision, TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import {
  ActionIcon,
  Button,
  em,
  Group,
  Progress,
  rgba,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback, useHover } from "@mantine/hooks";
import {
  IconCalendar,
  IconCornerDownRight,
  IconFlag,
  IconFlagFilled,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconSquareCheckFilled,
  IconSquareDashed,
  IconSubtask,
  IconTagPlus,
} from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";
import { taskPriorities } from "../../task-constants";
import { getTaskDragId, useDndTasks, useTaskDrag } from "../../tasks-dnd-provider";
import { ListTaskRowDropper } from "./list.task-row-dropper";

export const ListTaskRow: FC<{
  id: string;
  generation?: number;
  showDivider?: boolean;
  limitName?: number;
  allowEditName?: boolean;

  indexType?: "first" | "last";
  nextId?: string;
  prevId?: string;
}> = (props) => {
  const [isSubTasksVisible, setIsSubTasksVisible] = useState(false);
  const [task, ctx] = useTask(props.id, undefined, isSubTasksVisible);
  const color = useColor();

  const { open } = useTasks();
  const hover = useHover();

  const [forceHover, setForceHover] = useState(false);
  const hovered = hover.hovered || forceHover;

  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();

  const dndTasks = useDndTasks();
  const { draggingTaskId } = dndTasks;

  const [isEditName, setIsEditName] = useState(false);

  const onChangeName = useDebouncedCallback((name: string) => {
    if (!task._id || !name) return;
    ctx.onUpdate({ ...task, name });
  }, 500);

  if (!task || task.isArchived) return null;

  const toggleSubTasks = () => setIsSubTasksVisible((s) => !s);

  const generation = props.generation || 0;
  const allowEditName = typeof props.allowEditName === "undefined" ? true : props.allowEditName;

  const indexSpacing = generation * 16;
  const childIndexSpacing = (generation + 1) * 16;
  const isHasChild = task.childCount > 0;

  const taskParent = getTaskEntity(task.parentId);

  const draggableId = getTaskDragId(task._id, "row");
  const draggingTask = getTaskEntity(draggingTaskId);

  const isSelfDragging = draggingTaskId === props.id;
  const isDraggingAsParent = draggingTaskId === task.parentId;
  const isDraggingAsRootAndHasChild = draggingTask && draggingTask.childCount > 0;
  const isDraggingAsRootHasChild_thisAsChild =
    draggingTask && draggingTask.childCount > 0 && !!task.parentId;
  const isAbleToDrop = draggingTask && !isSelfDragging && !isDraggingAsParent;
  const draggable = useTaskDrag(task._id, "row");

  return (
    <Stack gap={0} w="100%">
      <Group
        wrap="nowrap"
        gap={0}
        ref={hover.ref}
        id={draggableId}
        h={50}
        w="100%"
        opacity={isSelfDragging ? 0.5 : 1}
        style={{
          position: "relative",
          borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
          borderBottomWidth: props.showDivider ? 0.5 : 0,
          borderRadius: 5,
        }}
        bg="var(--mantine-color-body)"
      >
        <ListTaskRowDropper
          visible={
            isAbleToDrop && props.prevId !== draggingTaskId && !isDraggingAsRootHasChild_thisAsChild
          }
          indexSpacing={indexSpacing * 3}
          targetTask={task}
          position={ReorderTaskPotision.BEFORE}
        />

        <ListTaskRowDropper
          visible={
            isAbleToDrop &&
            props.indexType === "last" &&
            !isHasChild &&
            !isDraggingAsRootHasChild_thisAsChild
          }
          indexSpacing={indexSpacing * 3}
          targetTask={task}
          position={ReorderTaskPotision.AFTER}
        />

        <ActionIcon
          ref={draggable.setNodeRef}
          {...draggable.listeners}
          {...draggable.attributes}
          variant="transparent"
          color="gray"
          style={{ cursor: "move", outline: "none" }}
          mr={-5}
        >
          <IconGripVertical size={16} strokeWidth={1.2} />
        </ActionIcon>

        <ActionIcon
          color={ctx.isSelected ? color("primary") : "gray"}
          variant="subtle"
          opacity={
            (hovered || ctx.isSelected || layout.view !== "desktop") && ctx.isAbleToSelect ? 1 : 0
          }
          style={{ visibility: ctx.isAbleToSelect ? "visible" : "hidden" }}
          onClick={(e) => ctx.toggleSelect(e.shiftKey)}
          disabled={!ctx.isAbleToSelect}
        >
          {ctx.isSelected ? (
            <IconSquareCheckFilled size={18} />
          ) : (
            <IconSquareDashed strokeWidth={1.5} size={18} />
          )}
        </ActionIcon>

        <Group pl={indexSpacing} flex={1} py={5} gap={5} wrap="nowrap">
          <Renderer visible={!!task.parentId}>
            <ThemeIcon size="xs" color="gray" variant="transparent">
              <IconCornerDownRight strokeWidth={1.5} />
            </ThemeIcon>
          </Renderer>

          <TaskStatusOptions task={task} onSelect={(s) => ctx.onUpdate({ ...task, status: s })} />

          <Group
            flex={1}
            gap={10}
            id="pointed"
            style={{
              cursor: isEditName ? "text" : "pointer",
              position: "relative",
            }}
            onClick={() => {
              if (!isEditName && !forceHover) open(task);
            }}
            wrap="nowrap"
          >
            <Group flex={1} gap={5} wrap="nowrap">
              <Renderer visible={!!ctx.tags.length}>
                <Group gap={3} wrap="nowrap">
                  {ctx.tags.map((tag) => (
                    <TaskTag
                      key={tag._id}
                      id={tag._id}
                      h={26}
                      onRemove={() => {
                        ctx.onUpdate({
                          ...task,
                          tagIds: task.tagIds?.filter((v) => v !== tag._id),
                        });
                      }}
                    />
                  ))}
                </Group>
              </Renderer>

              {isEditName ? (
                <ContentEditable
                  fz={16}
                  fw={500}
                  autoFocus
                  value={task.name}
                  onChange={onChangeName}
                  onEnter={() => setIsEditName(false)}
                  onBlur={() => setIsEditName(false)}
                />
              ) : (
                <Text
                  fz={16}
                  fw={500}
                  c={hover.hovered ? color("primary") : undefined}
                  truncate="end"
                  maw={650}
                >
                  {String.limitCharacters(task.name, props.limitName || 100)}
                </Text>
              )}
            </Group>

            <Renderer visible={isHasChild}>
              <Group gap={3} wrap="nowrap">
                <Button
                  size="compact-sm"
                  color="gray.8"
                  variant="subtle"
                  leftSection={<IconSubtask size={16} style={{ marginRight: -6 }} />}
                  fz={em(12)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubTasks();
                  }}
                >
                  <NumberFormat value={task.childCount} />
                </Button>

                <Group flex={1} justify="end" gap={5}>
                  <Text fz={em(10)}>
                    <NumberFormat value={ctx.progress.percent} suffix="%" />
                  </Text>
                  <Progress
                    value={ctx.progress.percent}
                    w={60}
                    color={ctx.progress.status.color || "dark"}
                  />
                </Group>
              </Group>
            </Renderer>

            <Renderer visible={!isEditName && hovered}>
              <Group
                gap={2}
                wrap="nowrap"
                pl={35}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(to right, ${rgba(
                    "var(--mantine-color-body)",
                    0
                  )}, ${rgba("var(--mantine-color-body)", 1)}, ${rgba(
                    "var(--mantine-color-body)",
                    1
                  )}, ${rgba("var(--mantine-color-body)", 1)})`,
                }}
              >
                <Renderer visible={!task.parentId}>
                  <Tooltip label={t`Create subtask`}>
                    <ActionIcon
                      variant="subtle"
                      color="gray.6"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        OnModalCreateTask({ parentId: task._id });
                      }}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Renderer>

                <Renderer visible={allowEditName}>
                  <Tooltip label={t`Edit task name`}>
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
                </Renderer>

                <TagSelector
                  type={TagType.TASK}
                  onSelect={(tag) => {
                    if (!tag) return;
                    ctx.onUpdate({
                      ...task,
                      tagIds: [...new Set([...(task.tagIds || []), tag._id])],
                    });
                  }}
                  onOpen={() => setForceHover(true)}
                  onClose={() => setForceHover(false)}
                  target={(selector) => {
                    return (
                      <Tooltip label={t`Add tags`}>
                        <ActionIcon
                          variant="subtle"
                          color="gray.6"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selector.toggle();
                          }}
                        >
                          <IconTagPlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    );
                  }}
                />
              </Group>
            </Renderer>
          </Group>

          <Group w={150} px={10}>
            <WorkspaceMembersInput
              collapsed
              value={task.assigneeUsers}
              onChange={(users) =>
                ctx.onUpdate({
                  ...task,
                  assigneeUserIds: users.map((v) => v.userId),
                  assigneeUsers: users,
                })
              }
            />
          </Group>

          <Group w={200} px={10}>
            <CustomerInput
              value={task.relatedCustomer || undefined}
              onSelect={(customer) =>
                ctx.onUpdate({
                  ...task,
                  relatedCustomerId: customer?._id || undefined,
                  relatedCustomer: customer || undefined,
                })
              }
              clearable
            />
          </Group>

          <Group w={150} px={10}>
            <ButtonSelect
              inactiveColor="gray.4"
              size={32}
              icon={IconCalendar}
              label={task.dueDate ? <DateFormat value={task.dueDate} type="date" /> : ""}
              activeColor={ctx.isOutdated ? "red" : "blue"}
              isActive={!!task.dueDate}
              dropdown={() => (
                <DueDateInput
                  p={5}
                  startDate={task.startDate}
                  dueDate={task.dueDate}
                  onChange={(e) => {
                    ctx.onUpdate({ ...task, ...e });
                  }}
                />
              )}
              onClear={() => ctx.onUpdate({ ...task, dueDate: null, startDate: null })}
            />
          </Group>

          <Group w={70} px={10} justify="center">
            <ButtonSelect
              inactiveColor="gray.4"
              size={32}
              icon={task.priority ? IconFlagFilled : IconFlag}
              value={task.priority}
              isActive={!!task.priority}
              hideOptionLabel
              options={Object.values(TaskPriority)
                .reverse()
                .map((priority) => ({
                  value: priority,
                  label: taskPriorities[priority].label(),
                  icon: IconFlagFilled,
                  activeColor: taskPriorities[priority].color,
                }))}
              onChange={(value) => {
                ctx.onUpdate({ ...task, priority: value as any });
              }}
              onClear={() => ctx.onUpdate({ ...task, priority: undefined })}
            />
          </Group>
        </Group>

        <ListTaskRowDropper
          isSubTask
          indexSpacing={childIndexSpacing * 2}
          targetTask={task}
          position={ReorderTaskPotision.AFTER}
          visible={isAbleToDrop && !task.parentId && !isHasChild && !isDraggingAsRootAndHasChild}
        />

        {taskParent && (
          <ListTaskRowDropper
            targetTask={taskParent}
            position={ReorderTaskPotision.AFTER}
            visible={isAbleToDrop && props.indexType === "last"}
          />
        )}
      </Group>

      {isSubTasksVisible && ctx.subTasks.length > 0 && (
        <Fragment>
          {ctx.subTasks.map((subTask, childIndex) => (
            <ListTaskRow
              key={subTask._id}
              id={subTask._id}
              showDivider
              generation={generation + 1}
              indexType={
                childIndex === ctx.subTasks.length - 1
                  ? "last"
                  : childIndex === 0
                  ? "first"
                  : undefined
              }
              nextId={ctx.subTasks[childIndex + 1]?._id}
              prevId={ctx.subTasks[childIndex - 1]?._id}
            />
          ))}
        </Fragment>
      )}
    </Stack>
  );
};
