"use client";

import { type FC } from "react";
import { useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";
import { useTasks } from "./tasks-context";
import { useApolloClient } from "@apollo/client/react";

import QUERY_TASK_BY_ID, {
  type TaskByIdQuery,
  type TaskByIdQueryVariables,
} from "./queries/queryTaskById.graphql";

export const TasksRealtimeEvents: FC = () => {
  const { state } = useTasks();
  const client = useApolloClient();

  useEventsListener(
    [EventType.TASKS_UPDATED],
    async (ev) => {
      if (!ev.ref) return;

      // const task = await client.query<TaskByIdQuery, TaskByIdQueryVariables>({
      //   query: QUERY_TASK_BY_ID,
      //   variables: {
      //     id: ev.ref,
      //   },
      // });
    },
    [state]
  );

  return null;
};
