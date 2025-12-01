"use client";

import { useApolloClient } from "@apollo/client/react";
import MUTATION_BULK_UPDATE_TASKS, {
  type BulkUpdateTasksMutation,
  type BulkUpdateTasksMutationVariables,
} from "../queries/mutationBulkUpdateTasks.graphql";

import type { UpdateTaskInput } from "@/graphql/types.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useCallback, useEffect, useRef } from "react";
import TASK_FRAGMENT, { type TaskDataFragment } from "../queries/fragmentTask.graphql";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../queries/queryTasks.graphql";
import { useTasks } from "../tasks-context";

export interface UpdateTaskContext {
  fromGroupVariables?: TasksQueryVariables;
  toGroupVariables?: TasksQueryVariables;
}

type UpdateTask = Partial<TasksQuery["tasks"]["data"][number]> & {
  _id: string;
  context?: UpdateTaskContext;
};

const normalizeTaskForSubmit = (
  task: Partial<TaskDataFragment> & { _id: string }
): UpdateTaskInput => {
  let input: UpdateTaskInput = { _id: task._id };

  if ("name" in task) {
    input.name = task.name;
  }

  if ("description" in task) {
    input.description = task.description;
  }

  if ("order" in task) {
    input.order = task.order;
  }

  if ("assigneeUsers" in task) {
    input.assigneeUserIds = task.assigneeUsers?.map((user) => user.userId) ?? [];
  }

  if ("customer" in task) {
    input.customerId = task.customer?._id ?? null;
  }

  if ("tags" in task) {
    input.tagIds = task.tags?.map((tag) => tag._id) ?? [];
  }

  if ("priority" in task) {
    input.priority = task.priority;
  }

  if ("status" in task) {
    input.status = task.status;
  }

  if ("dueDate" in task) {
    input.dueDate = task.dueDate;
  }

  if ("startDate" in task) {
    input.startDate = task.startDate;
  }

  if ("estimatedTime" in task) {
    input.estimatedTime = task.estimatedTime;
  }

  if ("folderId" in task) {
    input.folderId = task.folderId;
  }

  if ("parentId" in task) {
    input.parentId = task.parentId;
  }

  if ("partners" in task) {
    input.partnerIds = task.partners?.map((partner) => partner._id) ?? null;
  }

  if ("isArchived" in task) {
    input.isArchived = task.isArchived;
  }

  return input;
};

export const useUpdateTasks = () => {
  const client = useApolloClient();
  const tasks = useTasks();
  const dynamicVariables = useRef<TasksQueryVariables>({});

  // Keep ref in sync with latest tagFolder value
  useEffect(() => {
    dynamicVariables.current = {
      ...tasks.state.variables,
    };
  }, [tasks.activatedFolder]);

  const updateTasks = useCallback(
    async (data: UpdateTask[] | UpdateTask) => {
      try {
        const updateTasks = Array.isArray(data) ? data : [data];

        updateTasks.forEach((updatedTask) => {
          const identifiedId = client.cache.identify({
            __typename: "Task",
            _id: updatedTask._id,
          });

          const currentData = client.cache.readFragment<TaskDataFragment>({
            id: identifiedId,
            fragment: TASK_FRAGMENT,
          });

          if (!currentData) return;

          const updatedData = { ...currentData, ...updatedTask };

          // Update current task data
          client.cache.writeFragment({
            fragment: TASK_FRAGMENT,
            data: updatedData,
            id: identifiedId,
          });

          // Change status
          if (
            updatedTask.status &&
            updatedTask.context?.fromGroupVariables &&
            updatedTask.context?.toGroupVariables
          ) {
            // Remove from current status group
            client.cache.updateQuery<TasksQuery, TasksQueryVariables>(
              {
                query: QUERY_TASKS,
                variables: updatedTask.context.fromGroupVariables,
                overwrite: true,
              },
              (prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  tasks: {
                    ...prev.tasks,
                    data: [...prev.tasks.data.filter((t) => t._id !== currentData._id)],
                  },
                };
              }
            );

            // Add to target status group
            client.cache.updateQuery<TasksQuery, TasksQueryVariables>(
              {
                query: QUERY_TASKS,
                variables: updatedTask.context.toGroupVariables,
                overwrite: true,
              },
              (prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  tasks: {
                    ...prev.tasks,
                    data: [
                      ...prev.tasks.data.filter((t) => t._id !== updatedTask._id),
                      updatedData,
                    ],
                  },
                };
              }
            );
          }
        });

        await client.mutate<BulkUpdateTasksMutation, BulkUpdateTasksMutationVariables>({
          mutation: MUTATION_BULK_UPDATE_TASKS,
          variables: {
            items: updateTasks.map(normalizeTaskForSubmit),
          },
        });
      } catch (error) {
        console.error(error);
        onError(error);
      }
    },
    [client]
  );

  return { updateTasks };
};
