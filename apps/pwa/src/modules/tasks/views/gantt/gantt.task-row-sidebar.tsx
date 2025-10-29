"use client";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { NumberFormat } from "@/components/format/number-format";
import { formatDuration, QuickEstimateTimeInput } from "@/components/inputs/estimate-time-input";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { TagSelector } from "@/modules/tags/components/tag-selector";
import { TagType } from "@/modules/tags/tags-types";
import { QuickCreateTaskInput } from "@/modules/tasks/components/quick-create-task-input";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTaskEntity } from "@/modules/tasks/tasks-service";
import { ReorderTaskPotision } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@lingui/core/macro";
import { ActionIcon, Box, Button, em, Group, rgba, ThemeIcon, Title, Tooltip } from "@mantine/core";
import { useDebouncedCallback, useHover, useMergedRef } from "@mantine/hooks";
import {
  IconArrowRight,
  IconCornerDownRight,
  IconGripVertical,
  IconHourglassHigh,
  IconPencil,
  IconPlus,
  IconSquareCheckFilled,
  IconSquareDashed,
  IconSubtask,
  IconTagPlus,
} from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";
import { getTaskDragId, useDndTasks, useTaskDrag } from "../../tasks-dnd-provider";
import { ListTaskRowDropper } from "../list/list.task-row-dropper";
import { ganttConfig } from "./gantt.config";
import { useGantt } from "./gantt.context";
import { useGanttTaskState } from "./gantt.hooks";
import { SidebarRowSticky } from "./gantt.layout";

export interface GanttTaskRowSidebarProps {
  id: string;
  generation?: number;

  indexType?: "first" | "last";
  nextId?: string;
  prevId?: string;
}

export const GanttTaskRowSidebar: FC<GanttTaskRowSidebarProps> = (props) => {
  const [task, ctx] = useTask(props.id);

  const tasks = useTasks();
  const gantt = useGantt();
  const layout = useLayout();
  const state = useGanttTaskState(task);
  const color = useColor();
  const [isEditName, setIsEditName] = useState(false);

  const dndTasks = useDndTasks();
  const { draggingTaskId } = dndTasks;

  const generation = props.generation || 0;

  const toggleSubTasks = () => {
    gantt.setTaskState(task._id, {
      ...state,
      isShowSubTasks: !state.isShowSubTasks,
    });
  };

  const onChangeName = useDebouncedCallback((name: string) => {
    if (!task._id || !name) return;
    ctx.onUpdate({ ...task, name });
  }, 500);

  const indexSpacing = generation * 16;
  const childIndexSpacing = (generation + 1) * 16;
  const isHasChild = ctx.subTasks.length > 0 || task.childCount > 0;

  const taskParent = getTaskEntity(task.parentId);

  const draggableId = getTaskDragId(task._id, "gantt");
  const draggingTask = getTaskEntity(draggingTaskId);

  const isSelfDragging = draggingTaskId === props.id;
  const isDraggingAsParent = draggingTaskId === task.parentId;
  const isDraggingAsRootAndHasChild = draggingTask && draggingTask.childCount > 0;
  const isDraggingAsRootHasChild_thisAsChild =
    draggingTask && draggingTask.childCount > 0 && !!task.parentId;
  const isAbleToDrop = draggingTask && !isSelfDragging && !isDraggingAsParent;

  const hover = useHover();
  const mergeRef = useMergedRef(hover.ref);
  const draggable = useTaskDrag(task._id, "gantt");

  return (
    <Fragment>
      <Group
        className="GanntTaskRow bg-content"
        wrap="nowrap"
        gap={0}
        id={draggableId}
        ref={mergeRef}
        style={{
          position: "relative",
          borderRadius: 5,
          minHeight: ganttConfig.rowHeight,
          maxHeight: ganttConfig.rowHeight,
        }}
        opacity={isSelfDragging ? 0.5 : 1}
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
            (hover.hovered || ctx.isSelected || layout.view !== "desktop") && ctx.isAbleToSelect
              ? 1
              : 0
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

        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "1px",
            background: rgba("var(--mantine-color-text)", 0.08),
          }}
        />

        <Group wrap="nowrap" flex={1} justify="space-between" py={5} pl={indexSpacing} gap={0}>
          <Renderer visible={!!task.parentId}>
            <ThemeIcon size="xs" color="gray" variant="transparent">
              <IconCornerDownRight strokeWidth={1.5} />
            </ThemeIcon>
          </Renderer>

          <TaskStatusOptions task={task} onSelect={(s) => ctx.onUpdate({ ...task, status: s })} />

          <Group
            flex={1}
            gap={5}
            style={{
              cursor: isEditName ? "text" : "pointer",
              position: "relative",
            }}
            onClick={() => {
              if (!isEditName) tasks.open(task);
            }}
            wrap="nowrap"
          >
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
              <Group gap={5}>
                <Title
                  fz={16}
                  fw={500}
                  style={{ cursor: "pointer" }}
                  c={state.hovered ? color("primary") : undefined}
                >
                  {task.name}
                </Title>

                {ctx.subTasks.length > 0 && (
                  <Group gap={3}>
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
                      <NumberFormat value={ctx.subTasks.length} />
                    </Button>
                  </Group>
                )}
              </Group>
            )}
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

        <SidebarRowSticky visible={hover.hovered}>
          {!task.parentId && (
            <Tooltip label={t`Create subtask`}>
              <Group>
                <QuickCreateTaskInput parentId={task._id} tagFolderId={task.tagFolderId}>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    opacity={hover.hovered ? 1 : 0}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </QuickCreateTaskInput>
              </Group>
            </Tooltip>
          )}

          <Tooltip label={t`Tag`}>
            <Group>
              <TagSelector
                type={TagType.TASK}
                onSelect={(tag) => {
                  if (!tag) return;
                  ctx.onUpdate({
                    ...task,
                    tagIds: [...(task.tagIds || []).filter((v) => v !== tag._id), tag._id],
                  });
                }}
                target={(ctx) => {
                  return (
                    <ActionIcon size="sm" variant="subtle" color="gray" onClick={ctx.toggle}>
                      <IconTagPlus size={16} />
                    </ActionIcon>
                  );
                }}
              />
            </Group>
          </Tooltip>

          <Tooltip
            label={`${t`Estimate time`}${
              task.estimatedTime ? `: ${formatDuration(task.estimatedTime)}` : ""
            }`}
          >
            <Group>
              <QuickEstimateTimeInput task={task}>
                <ActionIcon
                  variant="subtle"
                  color="gray.6"
                  size="sm"
                  opacity={hover.hovered ? 1 : 0}
                >
                  <IconHourglassHigh size={16} />
                </ActionIcon>
              </QuickEstimateTimeInput>
            </Group>
          </Tooltip>

          <Tooltip label={t`Edit task name`}>
            <ActionIcon
              variant="subtle"
              color="gray.6"
              size="sm"
              opacity={hover.hovered ? 1 : 0}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditName(true);
              }}
            >
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t`Scroll to task`}>
            <ActionIcon
              variant="transparent"
              size="sm"
              opacity={hover.hovered ? 1 : 0}
              disabled={!task.dueDate || !task.startDate}
              onClick={() => {
                if (task.startDate)
                  gantt.scrollToDate({
                    date: task.startDate * 1000,
                    behavior: "smooth",
                  });
              }}
              style={{
                cursor: !task.dueDate || !task.startDate ? "default" : "pointer",
              }}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip>
        </SidebarRowSticky>
      </Group>

      {state.isShowSubTasks && ctx.subTasks.length > 0 && (
        <Fragment>
          {ctx.subTasks
            .sort((a, b) => a.order - b.order)
            .map((task, index) => {
              return (
                <GanttTaskRowSidebar
                  key={task._id}
                  id={task._id}
                  generation={generation + 1}
                  indexType={
                    index === ctx.subTasks.length - 1 ? "last" : index === 0 ? "first" : undefined
                  }
                  nextId={ctx.subTasks[index + 1]?._id}
                  prevId={ctx.subTasks[index - 1]?._id}
                />
              );
            })}
        </Fragment>
      )}
    </Fragment>
  );
};
