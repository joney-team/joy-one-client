import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { TaskStatusDataFragment } from "./graphql/fragmentTaskStatus.graphql";
import { DefaultTaskStatusId } from "./tasks-types";
import { TaskPriority } from "@/graphql/enums.graphql";

export const taskPriorities: Record<
  TaskPriority,
  {
    label: MacroMessageDescriptor;
    color: MantineColor;
  }
> = {
  [TaskPriority.Low]: {
    label: defineMessage`Low`,
    color: "gray",
  },
  [TaskPriority.Medium]: {
    label: defineMessage`Medium`,
    color: "primary",
  },
  [TaskPriority.High]: {
    label: defineMessage`High`,
    color: "orange",
  },
  [TaskPriority.Urgent]: {
    label: defineMessage`Urgent`,
    color: "red",
  },
};

export const defaultTaskStatus: Record<
  DefaultTaskStatusId,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  TODO: {
    label: defineMessage`Todo`,
    color: "gray",
  },
  CLOSED: {
    label: defineMessage`Closed`,
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
          name: status.name ?? t(defaultTaskStatus[statusId].label).toUpperCase(),
          color: status.color ?? defaultTaskStatus[statusId].color,
        };
      }

      return status;
    })
    .sort((a, b) => a.order - b.order);
};
