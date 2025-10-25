import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { DefaultTaskStatusId, TaskPriority } from "./tasks-types";

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
