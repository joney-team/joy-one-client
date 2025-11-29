"use client";

import { useLayout } from "@/layout/layout-context";
import { getTaskEntites, getTaskEntity, updateTasks } from "@/modules/tasks/tasks-service";
import { addItemToIndex } from "@/utils/array.utils";
import { objSelect } from "@/utils/object.utils";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useForceUpdate } from "@mantine/hooks";
import { createContext, FC, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { TaskCardOverlay } from "./tasks-dnd-overlay";
import { ReorderTaskPotision, TaskEntity } from "./tasks-types";

export interface DndTasksContextState {
  draggingTaskId?: string;
  viewType?: string;
  overlayHeight?: number;
  overlayWidth?: number;
  overlayOpacity?: number;
  ignoreStatus?: boolean;
  ignoreTagFolder?: boolean;
}

interface UseTaskDragProps extends DndTasksContextState {
  prefixId?: string;
}

const context = createContext({} as DndTasksContextState);

const viewTypeOpacities = {
  row: 0.9,
  card: 1,
};

// const isDebug = ENV === 'development';
const isDebug = false;

export const TasksDndProvider: FC<PropsWithChildren> = (props) => {
  const state = useRef<DndTasksContextState>({});

  const forceUpdate = useForceUpdate();
  const viewport = useLayout();

  const sensors = useSensors(
    viewport.view === "desktop"
      ? useSensor(MouseSensor, {
          activationConstraint: {
            distance: 2,
          },
        })
      : useSensor(TouchSensor, {
          activationConstraint: {
            distance: 5,
          },
        })
  );

  const reset = () => {
    state.current = {};
    forceUpdate();
  };

  useEffect(() => {
    if (state.current?.draggingTaskId) reset();
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        if (!e.active.data.current || !e.active.id) return;

        const dragElement = document.getElementById(e.active.id.toString());
        if (!dragElement) return;

        state.current = {
          draggingTaskId: e.active.data.current.taskId,
          viewType: e.active.data.current.viewType,
          overlayWidth: dragElement.clientWidth,
          overlayHeight: dragElement.clientHeight,
          ignoreTagFolder: e.active.data.current.ignoreTagFolder,
          ignoreStatus: e.active.data.current.ignoreStatus,
        };

        forceUpdate();
      }}
      onDragCancel={() => {
        reset();
      }}
      onDragEnd={(e) => {
        if (!state.current.draggingTaskId || !e.over || !e.over.data.current) {
          return reset();
        }

        const draggingTask = getTaskEntity(state.current.draggingTaskId);
        if (!draggingTask) return reset();

        const allTasks = getTaskEntites().sort((a, b) => a.order - b.order);
        const changeStatus = e.over.data.current.changeStatus as string;
        const folderId = e.over.data.current.folderId as string;
        const status = e.over.data.current.status as string;
        const changeParentId = e.over.data.current.changeParentId as string;

        // Bind properties
        let task = { ...allTasks.find((v) => v._id === draggingTask._id) } as TaskEntity;
        if (folderId) task.folderId = folderId;
        if (status) task.status = status;
        if (changeStatus) task.status = changeStatus;
        if (changeParentId) task.parentId = changeParentId === "root" ? null : changeParentId;

        let updatedTasks: TaskEntity[] = [];

        const targetTask = getTaskEntity(e.over.data.current.taskId);

        // Reorder
        if (targetTask) {
          const position = e.over.data.current.position as ReorderTaskPotision;
          const isSubTask = !!e.over.data.current.isSubTask as boolean;

          if (isDebug) {
            console.log("Reorder");
            console.log("• task", task.name, task.order);
            console.log("• targetTask", targetTask.name, position);
            console.log("• isSubTask", isSubTask);
          }

          const relatedTasks = allTasks
            .filter((t) =>
              isSubTask
                ? t.parentId === targetTask._id
                : t._id !== task._id && t.parentId === targetTask.parentId
            )
            .filter((t) => !!state.current.ignoreTagFolder || t.folderId === targetTask.folderId);

          if (isDebug) {
            console.log(
              "• relatedTasks",
              relatedTasks.map((v) => JSON.stringify(objSelect(v, ["name", "order"])))
            );
          }

          const indexOfTarget = relatedTasks.findIndex((t) => t._id === targetTask._id);
          const indexOfPosition = isSubTask
            ? 0
            : position === ReorderTaskPotision.AFTER
            ? indexOfTarget + 1
            : indexOfTarget;

          // const startOrder = relatedTasks[0]?.order || 0;

          updatedTasks = addItemToIndex(
            relatedTasks,
            {
              ...task,
              parentId: isSubTask ? targetTask._id : relatedTasks[0].parentId,
              folderId: state.current.ignoreTagFolder ? task.folderId : relatedTasks[0]?.folderId,
            },
            indexOfPosition
          ).map((t, i) => ({ ...t, order: i }));

          // Đổi folder -> Các công việc con cũng phải chuyển folder
          const isChangefolderId = task.folderId !== targetTask.folderId;
          let subTasksChanged: TaskEntity[] = [];
          if (isChangefolderId) {
            subTasksChanged = allTasks
              .filter((t) => t.parentId && t.parentId === task._id)
              .map((t) => ({ ...t, folderId: targetTask.folderId }));

            updatedTasks = updatedTasks.filter(
              (v) => !subTasksChanged.find((k) => k._id === v._id)
            );
            updatedTasks = [...updatedTasks, ...subTasksChanged];
          }
        } else {
          // Only update properties
          updatedTasks = [task];
        }

        if (isDebug) {
          console.log(
            "updatedTasks",
            updatedTasks.map((v) => JSON.stringify(objSelect(v, ["name", "order", "status"])))
          );
          console.log("\n");
        }

        updateTasks(updatedTasks);
        return reset();
      }}
    >
      <context.Provider value={state.current || {}}>{props.children}</context.Provider>

      <DragOverlay
        style={{
          width: 280,
          height: 42,
        }}
      >
        {state.current.draggingTaskId && <TaskCardOverlay id={state.current.draggingTaskId} />}
      </DragOverlay>
    </DndContext>
  );
};

export const useDndTasks = () => useContext(context);

export const useTaskDrop = (
  id: string,
  data?: {
    taskId?: string;
    position?: ReorderTaskPotision;
    isSubTask?: boolean;
    folderId?: string;
    changeStatus?: string | null;
    changeParentId?: string;
  }
) => {
  const _id = `${id}-${data?.taskId ? data.taskId : "r"}`;
  const drop = useDroppable({
    id: _id,
    data: data || {},
  });

  return {
    ...drop,
    id: _id,
  };
};

export const getTaskDragIdLegacy = (state: UseTaskDragProps) => {
  return `${state.draggingTaskId}-${state.viewType}-${state.prefixId || "task"}`;
};

export const useTaskDragLegacy = (state: UseTaskDragProps) => {
  const _id = getTaskDragIdLegacy(state);

  const draggable = useDraggable({
    id: _id,
    data: state,
  });

  return {
    ...draggable,
    overlayId: `overlay-${_id}`,
  };
};

export const getTaskDragId = (taskId: string, viewType: string) => {
  return `${taskId}-${viewType}`;
};

export const useTaskDrag = (taskId: string, viewType: string, disabled?: boolean) => {
  const dragId = getTaskDragId(taskId, viewType);

  const draggable = useDraggable({
    id: dragId,
    disabled,
    data: { viewType, taskId },
  });

  return {
    ...draggable,
    dragId,
  };
};
