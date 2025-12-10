"use client";

import { ResponseList } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import {
  Icon,
  IconApiApp,
  IconAssembly,
  IconBulb,
  IconCheck,
  IconCircleFilled,
  IconCodeCircle,
  IconDatabase,
  IconEyeglass,
  IconLayoutList,
  IconMinus,
  IconPointFilled,
  IconTestPipe,
} from "@tabler/icons-react";
import EventEmitter from "events";
import { v4 as uuid } from "uuid";
import { api } from "../apis";
import { defaultTaskStatus } from "./task-constants";
import {
  DefaultTaskStatusId,
  TaskDto,
  TaskEntity,
  TaskHistory,
  TaskPriority,
  TaskStatus,
} from "./tasks-types";

export const tasksEmitter = new EventEmitter();
tasksEmitter.setMaxListeners(500);

export let taskEntities: { [id: string]: TaskEntity } = {};

export const getTaskEntity = (id?: string | undefined | null) =>
  id ? taskEntities[id] : undefined;

export const getTaskEntityByCode = (code?: string | undefined | null) =>
  Object.values(taskEntities).find((v) => v.code === code);

export const getTaskEntites = () => Object.values(taskEntities).sort((a, b) => a.order - b.order);

export async function createTask(payload: TaskDto) {
  const task = await api.post<TaskEntity>("/tasks", payload);
  taskEntities[task._id] = task;
  tasksEmitter.emit("update", [task]);
  return task;
}

export async function getTask(_id: string) {
  const response = await api.get<TaskEntity>(`/tasks/${_id}`);
  taskEntities[_id] = response;
  return response;
}

export async function getTaskByCode(code: string) {
  const response = await api.get<TaskEntity>(`/tasks/codes/${code}`);
  taskEntities[response._id] = response;
  return response;
}

export async function getTasks(query: any) {
  const response = await api.get<ResponseList<TaskEntity>>("/tasks", { params: query });
  response.data.map((v) => (taskEntities[v._id] = v));
  return response;
}

export const TaskIcons: { [id: string]: Icon } = {
  IconPointFilled: IconPointFilled,
  IconCircleFilled: IconCircleFilled,
  IconBulb: IconBulb,
  IconCodeCircle: IconCodeCircle,
  IconApiApp: IconApiApp,
  IconTestPipe: IconTestPipe,
  IconAssembly: IconAssembly,
  IconEyeglass: IconEyeglass,
  IconDatabase: IconDatabase,
  IconLayoutList: IconLayoutList,
  IconCheck: IconCheck,
  IconMinus: IconMinus,
};

export const DefaultTaskStatusColors: { [id: string]: string } = {
  [DefaultTaskStatusId.TODO]: "gray",
  [DefaultTaskStatusId.CLOSED]: "green",
};

export const DefaultTaskStatusIcons: { [id: string]: string } = {
  [DefaultTaskStatusId.TODO]: "IconPointFilled",
  [DefaultTaskStatusId.CLOSED]: "IconCheck",
};

export function renderTaskStatusStyle(statusId: string, workspaceStatuses: TaskStatus[]) {
  const status =
    workspaceStatuses.find((s) => s.id === statusId) ||
    workspaceStatuses.find((v) => v.id === DefaultTaskStatusId.TODO)!;

  const icon =
    status.icon && TaskIcons[status.icon]
      ? TaskIcons[status.icon]
      : TaskIcons[DefaultTaskStatusIcons[statusId]] || TaskIcons["IconCircleFilled"];

  const name: string = status.name || defaultTaskStatus[statusId as DefaultTaskStatusId]?.label();

  const color =
    status.color || defaultTaskStatus[status.id as DefaultTaskStatusId]?.color || "gray";

  return {
    icon,
    name: name?.toUpperCase(),
    color,
  };
}

export function getTaskPriorityColor(priority?: string) {
  return {
    [TaskPriority.LOW]: "gray",
    [TaskPriority.MEDIUM]: "primary",
    [TaskPriority.HIGH]: "orange",
    [TaskPriority.URGENT]: "red",
  }[priority || TaskPriority.LOW];
}

export function getTaskProgress(tasks: TaskEntity[], statuses: TaskStatus[]) {
  let indexOfProgressStatus = statuses.length - 1;

  const progress = tasks.reduce((output, task) => {
    const indexOfStatus = statuses.findIndex((s) => s.id === task.status);
    const progressOfTask = indexOfStatus / (statuses.length - 1);
    output += progressOfTask / tasks.length;

    if (indexOfStatus < indexOfProgressStatus) {
      indexOfProgressStatus = indexOfStatus;
    }

    return output;
  }, 0);

  return {
    percent: progress * 100,
    status: statuses[indexOfProgressStatus],
  };
}

export const updateTasks = async (
  tasks: (Partial<TaskEntity> & { _id: string })[],
  addToHistory = true
) => {
  const updatedTasks = tasks
    .filter((task) => !!taskEntities[task._id])
    .map((task) => ({ ...taskEntities[task._id], ...task }));

  taskEntities = {
    ...taskEntities,
    ...Object.fromEntries(updatedTasks.map((task) => [task._id, task])),
  };

  tasksEmitter.emit("update", updatedTasks);

  const response = await api.put<{
    updatedTasks: TaskEntity[];
    prevTasks: TaskEntity[];
  }>("/tasks", { items: tasks });

  if (addToHistory) {
    const taskHistory: TaskHistory = {
      id: uuid(),
      type: tasks.every((v) => v.isArchived) ? "ARCHIVE" : "UPDATE",
      prevTasks: response.prevTasks,
      tasks: response.updatedTasks,
    };

    tasksEmitter.emit("history", taskHistory);
  }

  return response.updatedTasks;
};

export const syncTasks = (opts: {
  prevTasks: TaskEntity[];
  updatedTasks: TaskEntity[];
  related: (task: TaskEntity) => boolean;
}) => {
  const _addedTasks: TaskEntity[] = [];
  const _updatedTasks: TaskEntity[] = [];
  const _removedTasks: TaskEntity[] = [];

  opts.updatedTasks.forEach((task) => {
    const isRelated = opts.related(task) && task.isArchived !== true;
    const isExisted = opts.prevTasks.some((v) => v._id === task._id);

    if (isRelated) {
      if (isExisted) _updatedTasks.push(task);
      else _addedTasks.push(task);
    } else if (isExisted) {
      _removedTasks.push(task);
    }
  });

  let balance = 0;
  let _tasks = [...opts.prevTasks];

  _tasks = _tasks.filter((t) => !_removedTasks.some((v) => v._id === t._id));
  _tasks = _tasks.map((t) => _updatedTasks.find((v) => v._id === t._id) || t);
  _tasks = _tasks.concat(_addedTasks);
  _tasks = _tasks.sort((a, b) => a.order - b.order);

  balance -= _removedTasks.length;
  balance += _addedTasks.length;

  return {
    isChanged: _addedTasks.length > 0 || _updatedTasks.length > 0 || _removedTasks.length > 0,
    balance,
    changed: _tasks,
  };
};

export const getRelatedTasks = (
  task: TaskEntity,
  options?: {
    includeSelf?: boolean;
    sameStatus?: boolean;
    sameFolderId?: boolean;
  }
) => {
  const _tasks = Object.values(taskEntities);

  return _tasks
    .filter((t) => (options?.includeSelf ? true : t._id !== task._id))
    .filter((t) => t.parentId === task.parentId)
    .filter((t) => (options?.sameFolderId ? t.folderId === task.folderId : true))
    .filter((t) => (options?.sameStatus ? t.status === task.status : true))
    .sort((a, b) => a.order - b.order);
};

export const isTaskOutdated = (task: Pick<TaskEntity, "dueDate" | "status">) => {
  return (
    !!task?.dueDate &&
    task.dueDate < DateTime.getNowInSeconds() &&
    task.status !== DefaultTaskStatusId.CLOSED
  );
};
