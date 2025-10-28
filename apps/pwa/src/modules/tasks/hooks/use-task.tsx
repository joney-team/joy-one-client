"use client";

import { useList } from "@/components/list/use-list";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { useTasks } from "@/modules/tasks/tasks-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useEffect, useState } from "react";
import {
  getTask,
  getTaskEntity,
  getTaskProgress,
  getTasks,
  syncTasks,
  taskEntities,
  tasksEmitter,
  updateTasks,
} from "../tasks-service";
import { DefaultTaskStatusId, TaskEntity, TaskStatus } from "../tasks-types";

export type UseTask = [
  TaskEntity,
  {
    isSelected: boolean;
    isAbleToSelect: boolean;
    toggleSelect: (isShiftKey?: boolean) => void;
    onUpdate: (task: TaskEntity) => void;
    nextStatus: () => Promise<void>;
    themeColor: string;
    tagFolder: TagEntity | null;
    isOutdated: boolean;
    subTasks: TaskEntity[];
    isAbleToNextStatus: boolean;
    tags: TagEntity[];
    progress: {
      percent: number;
      status: TaskStatus;
    };
  }
];

export const useTask = (id: string, initTask?: TaskEntity, isSkipLoadSubTasks = false): UseTask => {
  const tags = useTags();
  const workspace = useWorkspace();
  const tasks = useTasks();

  const [task, setTask] = useState<TaskEntity | null>(initTask || taskEntities[id] || null);
  const color = useColor();

  const currentStatusIndex = workspace.settings.taskStatuses.findIndex(
    (v) => v.id === task?.status
  );
  const isAbleToNextStatus = currentStatusIndex < workspace.settings.taskStatuses.length - 1;

  const onUpdate = (_task: TaskEntity) => {
    setTask(_task);
    updateTasks([_task]).catch(onError);
  };

  const subTaskList = useList({
    isSkip: isSkipLoadSubTasks,
    id: `sub-tasks-${id}`,
    fetch: (q) =>
      getTasks({
        ...q,
        parentId: id,
        getAll: true,
      }),
  });

  const subTasks = subTaskList.data.sort((a, b) => a.order - b.order);
  const progress = getTaskProgress(subTasks, workspace.settings.taskStatuses);

  onTasksUpdated(
    (updatedTasks) => {
      const relatedTask = updatedTasks.find((v) => v._id === id);
      if (relatedTask) setTask(relatedTask);

      const synced = syncTasks({
        prevTasks: subTasks,
        updatedTasks,
        related: (task) => task.parentId === id,
      });

      if (synced.isChanged) {
        subTaskList.setData(synced.changed, subTaskList.count + synced.balance);
      }
    },
    [id, subTasks]
  );

  useEffect(() => {
    if (!taskEntities[id]) getTask(id).then(setTask);
  }, [id]);

  const tagFolder = tags.list.find(
    (v) => v.type === TagType.TASK_FOLDER && v._id === task?.tagFolderId
  );
  const themeColor = color(tagFolder?.color || "primary");
  const isOutdated =
    !!task?.dueDate &&
    task.dueDate < DateTime.toSeconds(new Date()) &&
    task.status !== DefaultTaskStatusId.CLOSED;

  const nextStatus = async () => {
    if (!task) return;
    const currentIndex = workspace.settings.taskStatuses.findIndex((v) => v.id === task.status);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= workspace.settings.taskStatuses.length) return;
    updateTasks([{ ...task, status: workspace.settings.taskStatuses[nextIndex].id }]).catch(
      onError
    );
  };

  const toggleSelect = (isShiftKey?: boolean) => {
    if (!task) return;
    tasks.toggleSelectTask(task._id, isShiftKey);
  };

  const isSelected = !!task && tasks.selectedTaskIds.includes(task._id);
  const isAbleToSelect =
    !!task &&
    !task.isArchived &&
    tasks.selectedTaskIds.every((v) => getTaskEntity(v)?.parentId === task.parentId);

  const taskTags = tags.list.filter((v) => (task?.tagIds || []).includes(v._id));

  const taskCtx: UseTask[1] = {
    onUpdate,
    themeColor,
    tagFolder: tagFolder || null,
    isOutdated,
    subTasks,
    progress,
    isAbleToNextStatus,
    nextStatus,
    isSelected,
    toggleSelect,
    isAbleToSelect,
    tags: taskTags,
  };

  return [task, taskCtx] as UseTask;
};

export const onTasksUpdated = (handler: (tasks: TaskEntity[]) => void, deps?: any[]) => {
  useEffect(() => {
    tasksEmitter.addListener("update", handler);

    return () => {
      tasksEmitter.removeListener("update", handler);
    };
  }, [...(deps || []), handler]);
};
