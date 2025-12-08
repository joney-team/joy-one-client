"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useApolloClient } from "@apollo/client/react";
import { type FC } from "react";
import { useEventsListener } from "../events/event-service";
import { useTasks } from "./tasks-context";

import TASK_FRAGMENT, { type TaskDataFragment } from "./graphql/fragmentTask.graphql";

import QUERY_TASK_BY_ID, {
  type TaskByIdQuery,
  type TaskByIdQueryVariables,
} from "./graphql/queryTaskById.graphql";

export const TasksRealtimeEvents: FC = () => {
  const { state } = useTasks();
  const client = useApolloClient();

  useEventsListener(
    [EventType.TasksUpdated, EventType.TaskSynced],
    async (ev) => {
      if (!ev.ref) return;

      const task = await client.query<TaskByIdQuery, TaskByIdQueryVariables>({
        query: QUERY_TASK_BY_ID,
        variables: {
          id: ev.ref,
        },
        fetchPolicy: "network-only",
      });

      if (task.data?.task) {
        const identifiedId = client.cache.identify({
          __typename: "Task",
          _id: task.data?.task._id,
        });

        client.cache.updateFragment<TaskDataFragment>(
          {
            id: identifiedId,
            fragment: TASK_FRAGMENT,
            fragmentName: "TaskData",
          },
          (prev) => task.data?.task ?? prev
        );
      }
    },
    [state]
  );

  return null;
};
