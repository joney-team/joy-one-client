"use client";

import { Card, Portal, Text } from "@mantine/core";
import { FC, Fragment, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { TaskDataFragment } from "../../../../graphql/fragmentTask.graphql";

import { UpdateTaskContext, useUpdateTasks } from "../../../../hooks/use-update-tasks";
import { type TasksQueryVariables } from "../../../../graphql/queryTasks.graphql";
import { useGantt } from "../../gantt-tasks-context";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";

import { useColor } from "@/modules/theme/use-color";
import { ganttConfig } from "../../gantt-tasks-config";
import { useGanttTaskRow } from "../gantt-task-provider";

export const GanttTaskDraggable: FC<{
  children: (draggingRef: RefObject<HTMLDivElement | null>) => ReactNode;
}> = ({ children }) => {
  const color = useColor();
  const gantt = useGantt();
  const {
    rootRef,
    task,
    groupVariables,
    isAllowTopDroppable,
    nextTask,
    prevTask,
    nextParentTask,
    subTasksGroupVariables,
  } = useGanttTaskRow();

  const { updateTasks } = useUpdateTasks();
  const isLastChild = Boolean(task.parent) && !nextTask;

  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef<HTMLDivElement>(null);
  const draggingRefContainer = useRef<HTMLElement | null>(null);

  const droppableTopSiblingRef = useRef<HTMLDivElement>(null);
  const droppableTopChildrenRef = useRef<HTMLDivElement>(null);

  const droppableBottomSiblingRef = useRef<HTMLDivElement>(null);
  const droppableBottomChildrenRef = useRef<HTMLDivElement>(null);

  const droppableIndicatorTopRef = useRef<HTMLDivElement>(null);
  const droppableIndicatorTopIndentRef = useRef<HTMLDivElement>(null);

  const droppableIndicatorBottomRef = useRef<HTMLDivElement>(null);
  const droppableIndicatorBottomIndentRef = useRef<HTMLDivElement>(null);

  // Drag drop handlers
  useEffect(() => {
    if (
      !draggingRef.current ||
      !droppableBottomSiblingRef.current ||
      !droppableBottomChildrenRef.current ||
      !droppableTopSiblingRef.current
    )
      return;

    return combine(
      draggable({
        element: draggingRef.current,
        getInitialData() {
          return { task, groupVariables };
        },
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
        canDrag() {
          return !gantt.isGrabbing;
        },
      }),
      // Sibling Top drop target
      dropTargetForElements({
        element: droppableTopSiblingRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask || !isAllowTopDroppable) return false;

          return (
            sourceTask._id !== task._id &&
            sourceTask._id !== task.parentId &&
            sourceTask._id !== nextTask?._id &&
            !task.parentId
          );
        },
        onDragEnter() {
          droppableIndicatorTopRef.current?.style.setProperty("display", "block");
        },
        onDragLeave() {
          droppableIndicatorTopRef.current?.style.setProperty("display", "none");
        },
        onDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          return updateTasks({
            _id: sourceTask._id,
            parent: null,
            order: ((prevTask?.order ?? task.order / 2) + task.order) / 2,
            folder: task.folder ?? null,
            context,
          });
        },
      }),
      // Sibling Bottom drop target
      dropTargetForElements({
        element: droppableBottomSiblingRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return false;

          if (isLastChild && !sourceTask.parentId && sourceTask._id !== task.parentId) {
            return true;
          }

          return (
            sourceTask._id !== task._id &&
            sourceTask._id !== task.parentId &&
            sourceTask._id !== nextTask?._id &&
            !task.parentId
          );
        },
        onDragEnter() {
          droppableIndicatorBottomRef.current?.style.setProperty("display", "block");
        },
        onDragLeave() {
          droppableIndicatorBottomRef.current?.style.setProperty("display", "none");
        },
        onDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          if (isLastChild) {
            if (!task.parent) return;

            return updateTasks({
              _id: sourceTask._id,
              parent: null,
              folder: task.parent.folder ?? null,
              order: ((nextParentTask?.order ?? task.parent.order * 2) + task.parent.order) / 2,
              context,
            });
          }

          return updateTasks({
            _id: sourceTask._id,
            parent: null,
            order: ((nextTask?.order ?? task.order * 2) + task.order) / 2,
            folder: task.folder ?? null,
            context,
          });
        },
      }),
      // Children Bottom drop target
      dropTargetForElements({
        element: droppableBottomChildrenRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return false;

          return (
            sourceTask._id !== task._id &&
            sourceTask._id !== task.parentId &&
            sourceTask.childCount === 0
          );
        },
        onDragEnter() {
          droppableIndicatorBottomIndentRef.current?.style.setProperty("display", "block");
        },
        onDragLeave() {
          droppableIndicatorBottomIndentRef.current?.style.setProperty("display", "none");
        },
        onDrop({ source }) {
          const sourceTask = source.data.task as TaskDataFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as TasksQueryVariables,
            toGroupVariables: task.parent ? groupVariables : subTasksGroupVariables,
          };

          const newOrder = !task.parent
            ? (task.childOrder.first ?? 2) / 2
            : ((nextTask?.order ?? task.order * 2) + task.order) / 2;

          return updateTasks({
            _id: sourceTask._id,
            parent: task.parent ?? task,
            folder: task.folder ?? null,
            order: newOrder,
            context,
          });
        },
      }),
      monitorForElements({
        onDragStart: () => {
          droppableTopSiblingRef.current?.style.setProperty("display", "block");
          droppableTopChildrenRef.current?.style.setProperty("display", "block");
          droppableBottomSiblingRef.current?.style.setProperty("display", "block");
          droppableBottomChildrenRef.current?.style.setProperty("display", "block");
        },
        onDrop() {
          droppableTopSiblingRef.current?.style.setProperty("display", "none");
          droppableTopChildrenRef.current?.style.setProperty("display", "none");
          droppableBottomSiblingRef.current?.style.setProperty("display", "none");
          droppableBottomChildrenRef.current?.style.setProperty("display", "none");
          droppableIndicatorTopRef.current?.style.setProperty("display", "none");
          droppableIndicatorTopIndentRef.current?.style.setProperty("display", "none");
          droppableIndicatorBottomRef.current?.style.setProperty("display", "none");
          droppableIndicatorBottomIndentRef.current?.style.setProperty("display", "none");
        },
      })
    );
  }, [task, nextTask, nextParentTask, groupVariables, subTasksGroupVariables, gantt.isGrabbing]);

  return (
    <Fragment>
      {children(draggingRef)}
      <div
        ref={droppableIndicatorTopRef}
        style={{
          position: "absolute",
          height: ganttConfig.droppableIndicatorHeight,
          background: color("primary"),
          width: "100%",
          right: 0,
          top: 0,
          display: "none",
        }}
      />

      <div
        ref={droppableIndicatorTopIndentRef}
        style={{
          position: "absolute",
          height: ganttConfig.droppableIndicatorHeight,
          background: color("orange"),
          width: "calc(100% - 46px)",
          right: 0,
          top: 0,
          display: "none",
        }}
      />

      <div
        ref={droppableIndicatorBottomRef}
        style={{
          position: "absolute",
          height: ganttConfig.droppableIndicatorHeight,
          background: color("primary"),
          width: "100%",
          right: 0,
          bottom: 0,
          transform: "translateY(100%)",
          display: "none",
        }}
      />

      <div
        ref={droppableIndicatorBottomIndentRef}
        style={{
          position: "absolute",
          height: ganttConfig.droppableIndicatorHeight,
          background: color("orange"),
          width: "calc(100% - 46px)",
          transform: "translateY(100%)",
          right: 0,
          bottom: 0,
          display: "none",
        }}
      />

      <div
        ref={droppableTopSiblingRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "50%",
          width: "100%",
          display: "none",
          zIndex: 1,
        }}
      />

      <div
        ref={droppableTopChildrenRef}
        style={{
          position: "absolute",
          left: "20%",
          top: 0,
          height: "50%",
          width: "100%",
          display: "none",
          zIndex: 2,
        }}
      />

      <div
        ref={droppableBottomSiblingRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: "50%",
          width: "100%",
          display: "none",
          zIndex: 1,
        }}
      />

      <div
        ref={droppableBottomChildrenRef}
        style={{
          position: "absolute",
          left: "20%",
          bottom: 0,
          height: "50%",
          width: "100%",
          display: "none",
          zIndex: 2,
        }}
      />

      {isDragging && draggingRefContainer.current && (
        <Portal target={draggingRefContainer.current}>
          <Card
            shadow="xs"
            px={16}
            style={{ width: rootRef.current?.getBoundingClientRect().width }}
          >
            <Text fz="sm" fw={500} truncate>
              {task.name}
            </Text>
          </Card>
        </Portal>
      )}
    </Fragment>
  );
};
