"use client";

import { Card, CardProps, Group, Portal, Text } from "@mantine/core";
import {
  FC,
  Fragment,
  ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";

import { useColor } from "@/modules/theme/use-color";
import { type TaskFragment } from "../../graphql/fragmentTask.graphql";
import { GetTasksQueryVariables } from "../../graphql/getTasks.graphql";
import { type UpdateTaskContext, useUpdateTasks } from "../../hooks/use-update-tasks";

const config = {
  droppableIndicatorHeight: 3,
};

interface OverlayOptions extends CardProps {}

export const TaskRowDraggable: FC<{
  rootRef: RefObject<HTMLElement | null>;
  task: TaskFragment;
  groupVariables: GetTasksQueryVariables | null;
  nextParentTask: TaskFragment | null;
  isAllowTopDroppable?: boolean;
  nextTask: TaskFragment | null;
  prevTask: TaskFragment | null;
  subTasksGroupVariables: GetTasksQueryVariables | null;
  children: (draggingRef: Ref<HTMLDivElement | null>) => ReactNode;
  disabled?: boolean;
  droppableOptions?: {
    inherits?: (keyof TaskFragment)[];
  };
  overlayOptions?: OverlayOptions;
}> = ({
  children,
  rootRef,
  task,
  groupVariables,
  nextParentTask,
  isAllowTopDroppable,
  nextTask,
  prevTask,
  subTasksGroupVariables,
  disabled,
  droppableOptions = {},
  overlayOptions = {},
}) => {
  const color = useColor();

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

  const inherits =
    droppableOptions.inherits?.reduce<Partial<TaskFragment>>(
      (acc, key) => ({
        ...acc,
        [key]: task[key],
      }),
      {},
    ) ?? {};

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
          return !disabled;
        },
      }),
      // Sibling Top drop target
      dropTargetForElements({
        element: droppableTopSiblingRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskFragment;
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
          const sourceTask = source.data.task as TaskFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as GetTasksQueryVariables,
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
          const sourceTask = source.data.task as TaskFragment;
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
          const sourceTask = source.data.task as TaskFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as GetTasksQueryVariables,
            toGroupVariables: groupVariables,
          };

          if (isLastChild) {
            if (!task.parent) return;

            return updateTasks({
              _id: sourceTask._id,
              parent: null,
              folder: task.parent.folder ?? null,
              order: nextParentTask
                ? (nextParentTask.order * 2 + nextParentTask.order) / 2
                : (task.parent.order * 2 + task.parent.order) / 2,
              ...inherits,
              context,
            });
          }

          return updateTasks({
            _id: sourceTask._id,
            parent: null,
            order: ((nextTask?.order ?? task.order * 2) + task.order) / 2,
            folder: task.folder ?? null,
            ...inherits,
            context,
          });
        },
      }),
      // Children Bottom drop target
      dropTargetForElements({
        element: droppableBottomChildrenRef.current,
        canDrop({ source }) {
          const sourceTask = source.data.task as TaskFragment;
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
          const sourceTask = source.data.task as TaskFragment;
          if (!sourceTask) return;

          const context: UpdateTaskContext = {
            fromGroupVariables: source.data.groupVariables as GetTasksQueryVariables,
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
            ...inherits,
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
      }),
    );
  }, [
    task,
    nextTask,
    groupVariables,
    subTasksGroupVariables,
    disabled,
    droppableOptions,
    inherits,
  ]);

  return (
    <Fragment>
      {children(draggingRef)}

      <div
        ref={droppableIndicatorTopRef}
        style={{
          position: "absolute",
          height: config.droppableIndicatorHeight,
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
          height: config.droppableIndicatorHeight,
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
          height: config.droppableIndicatorHeight,
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
          height: config.droppableIndicatorHeight,
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
          left: 90,
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
            px="sm"
            py={0}
            style={{
              width: rootRef.current?.getBoundingClientRect().width,
            }}
            miw={0}
            h={40}
            {...overlayOptions}
          >
            <Group h="100%" align="center">
              <Text fz="sm" fw={500} truncate>
                {task.name}
              </Text>
            </Group>
          </Card>
        </Portal>
      )}
    </Fragment>
  );
};
