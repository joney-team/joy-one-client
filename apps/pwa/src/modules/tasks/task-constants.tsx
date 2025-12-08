import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { DefaultTaskStatusId, TaskPriority } from "./tasks-types";
import { TaskStatus } from "@/graphql/types.graphql";

export const taskPriorities: Record<
  TaskPriority,
  {
    label: () => string;
    color: MantineColor;
  }
> = {
  [TaskPriority.LOW]: {
    label: () => t`Low`,
    color: "gray",
  },
  [TaskPriority.MEDIUM]: {
    label: () => t`Medium`,
    color: "primary",
  },
  [TaskPriority.HIGH]: {
    label: () => t`High`,
    color: "orange",
  },
  [TaskPriority.URGENT]: {
    label: () => t`Urgent`,
    color: "red",
  },
};

export const defaultTaskStatusIds: Record<
  DefaultTaskStatusId,
  { label: () => string; color: MantineColor }
> = {
  TODO: {
    label: () => t`Todo`,
    color: "gray",
  },
  CLOSED: {
    label: () => t`Closed`,
    color: "green",
  },
};

export const combineTaskStatuses = (statuses: TaskStatus[]) => {
  const customTodoStatus = statuses.find((status) => status.id === DefaultTaskStatusId.TODO);

  const todoStatus: TaskStatus = {
    id: DefaultTaskStatusId.TODO,
    name: customTodoStatus?.name ?? defaultTaskStatusIds[DefaultTaskStatusId.TODO].label(),
    color: customTodoStatus?.color ?? defaultTaskStatusIds[DefaultTaskStatusId.TODO].color,
    order: 0,
  };

  const customClosedStatus = statuses.find((status) => status.id === DefaultTaskStatusId.CLOSED);

  const closedStatus = {
    id: DefaultTaskStatusId.CLOSED,
    name: customClosedStatus?.name ?? defaultTaskStatusIds[DefaultTaskStatusId.CLOSED].label(),
    color: customClosedStatus?.color ?? defaultTaskStatusIds[DefaultTaskStatusId.CLOSED].color,
    order: statuses.length + 1,
  };

  const dynamicStatuses = statuses.filter(
    (status) => status.id !== DefaultTaskStatusId.TODO && status.id !== DefaultTaskStatusId.CLOSED
  );

  return [todoStatus, ...dynamicStatuses, closedStatus];
};
