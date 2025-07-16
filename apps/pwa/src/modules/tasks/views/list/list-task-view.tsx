import { useLayout } from "@/layout/layout-context";
import { useQuery } from "@/modules/apis/use-query";
import { useTasks } from "@/modules/tasks/tasks-context";
import { ResponseList } from "@/types";
import { shiftSelect } from "@/utils/array.utils";
import { onError } from "@/utils/exceptions.utils";
import {
  closestCenter,
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Card, Skeleton, Stack } from "@mantine/core";
import { FC, memo, useRef, useState } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import { bulkUpdateTasks } from "../../tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "../../tasks-types";
import { ListTaskGroupByStatus } from "./components/list-task-group-by-status";
import { ListTaskRowOverlay } from "./components/list-task-row-overlay";
import { Context } from "./list-task-view-context";

export const TasksListView: FC = memo(() => {
  const layout = useLayout();
  const { statuses, tagFolder } = useTasks();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const clonedTasks = useRef<TaskEntity[]>([]);

  const tasksQuery = useQuery<ResponseList<TaskEntity>>({
    route: "/tasks",
    params: {
      getAll: true,
      parentId: "root",
      statusNotIn: [DefaultTaskStatusId.CLOSED],
      tagFolderId: tagFolder?._id,
      sort: "orderAsc",
    },
  });

  const tasks = tasksQuery.data?.data ?? [];

  const toggleSelectTask = (taskId: string, isShiftKey?: boolean) => {
    const pointedTask = tasks.find((v) => v._id === taskId);
    if (!pointedTask) return;

    const allTasks = tasks ?? [];
    const _relatedTaskIds = allTasks.map((v) => v._id);
    const _selectedTaskIds = _relatedTaskIds.filter((v) => selectedTaskIds.includes(v));

    if (isShiftKey && _relatedTaskIds.some((v) => selectedTaskIds.includes(v))) {
      const output = shiftSelect(
        _relatedTaskIds,
        taskId,
        _selectedTaskIds,
        selectedTaskIds[selectedTaskIds.length - 1]
      );
      setSelectedTaskIds((s) => [...new Set([...s, ...output])]);
    } else {
      setSelectedTaskIds((v) =>
        v.includes(taskId) ? v.filter((v) => v !== taskId) : [...v, taskId]
      );
    }
  };

  const updateTasks = (updatedTasks: TaskEntity[]) => {
    tasksQuery.set((state) => {
      if (!state) return state;
      return {
        ...state,
        data: state.data.map((task) => {
          const updatedTask = updatedTasks.find((t) => t._id === task._id);
          if (updatedTask) return { ...updatedTask };
          return task;
        }),
      };
    });
  };

  const sensors = useSensors(
    layout.view === "desktop"
      ? useSensor(PointerSensor, {
          activationConstraint: {
            distance: 5,
          },
        })
      : useSensor(TouchSensor, {
          activationConstraint: {
            distance: 5,
          },
        })
  );

  const onDragOver = async (event: DragOverEvent) => {
    try {
      const { active, over } = event;
      if (!over || !active) return;

      const overTask = tasks.find((v) => v._id === over.id.toString());
      const activeTask = tasks.find((t) => t._id === active.id);

      if (activeTask && overTask) {
        if (activeTask.status === overTask.status) {
          const relatedTasks = tasks.filter((v) => v.status === overTask.status);
          const oldIndex = relatedTasks.findIndex((v) => v._id === active.id.toString());
          const newIndex = relatedTasks.findIndex((v) => v._id === over.id.toString());
          const movedTasks = arrayMove(relatedTasks, oldIndex, newIndex);
          updateTasks(
            movedTasks.map((v, index) => ({ ...v, order: index, status: overTask.status }))
          );
        } else {
          const relatedTasks = tasks.filter((v) => v.status === overTask.status);
          const overIndex = relatedTasks.findIndex((t) => t._id == over.id);
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          const newIndex = overIndex >= 0 ? overIndex + modifier : relatedTasks.length + 1;
          updateTasks(
            [
              ...relatedTasks.slice(0, newIndex),
              { ...activeTask, status: overTask.status },
              ...relatedTasks.slice(newIndex, relatedTasks.length),
            ].map((v, index) => ({ ...v, order: index }))
          );
        }
      }

      const overStatus = statuses.find((v) => v.id === over.id);
      if (activeTask && overStatus) {
        updateTasks([{ ...activeTask, status: overStatus.id }]);
      }
    } catch (error) {
      onError(error);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    setSelectedTaskIds([]);
    setDraggingId(event.active.id.toString());
    clonedTasks.current = [...tasks];
  };

  const onDragCancel = () => {
    if (!clonedTasks.current) return;

    setDraggingId(null);
    updateTasks(clonedTasks.current);
  };

  const onDragEnd = async () => {
    try {
      await bulkUpdateTasks(tasks);
    } catch (error) {
      onError(error);
      updateTasks(clonedTasks.current);
    }
  };

  if (tasksQuery.isLoading)
    return (
      <Stack p={16}>
        <Skeleton height="50dvh" />
      </Stack>
    );

  return (
    <Context.Provider value={{ tasks, updateTasks, selectedTaskIds, toggleSelectTask, draggingId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragCancel={onDragCancel}
      >
        <Stack p={16}>
          <TaskMenuActions />
          <Card p={0}>
            <Stack gap={0}>
              {statuses.map((status) => {
                return (
                  <ListTaskGroupByStatus
                    key={status.id}
                    statusId={status.id}
                    tagFolderId={tagFolder?._id}
                  />
                );
              })}
            </Stack>
          </Card>
        </Stack>

        <DragOverlay style={{ width: 300, height: 30 }}>
          <ListTaskRowOverlay id={draggingId} />
        </DragOverlay>
      </DndContext>
    </Context.Provider>
  );
});
