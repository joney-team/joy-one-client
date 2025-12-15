import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { TaskStatusDataFragment } from "./graphql/fragmentTaskStatus.graphql";
import { DefaultTaskStatusId } from "./tasks-types";
import { TaskPriority } from "@/graphql/enums.graphql";

export const taskPriorities: Record<
  TaskPriority,
  {
    label: () => string;
    color: MantineColor;
  }
> = {
  [TaskPriority.Low]: {
    label: () => t`Low`,
    color: "gray",
  },
  [TaskPriority.Medium]: {
    label: () => t`Medium`,
    color: "primary",
  },
  [TaskPriority.High]: {
    label: () => t`High`,
    color: "orange",
  },
  [TaskPriority.Urgent]: {
    label: () => t`Urgent`,
    color: "red",
  },
};

export const defaultTaskStatus: Record<
  DefaultTaskStatusId,
  { label: () => string; color: MantineColor }
> = {
  TODO: {
    label: () => t`Todo`,
    color: "gray",
  },
  CLOSED: {
    label: () => t`Closed`,
    color: "teal",
  },
};

export const normalizeTaskStatuses = (statuses: TaskStatusDataFragment[]) => {
  return statuses
    .map((status) => {
      if (Object.values(DefaultTaskStatusId).includes(status.id as DefaultTaskStatusId)) {
        const statusId = status.id as DefaultTaskStatusId;
        return {
          ...status,
          name: status.name ?? defaultTaskStatus[statusId].label().toUpperCase(),
          color: status.color ?? defaultTaskStatus[statusId].color,
        };
      }

      return status;
    })
    .sort((a, b) => a.order - b.order);
};
