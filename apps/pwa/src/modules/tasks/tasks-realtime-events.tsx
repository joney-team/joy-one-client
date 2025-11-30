"use client";

import { type FC } from "react";
import { useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";
import { useTasks } from "./tasks-context";
import { useApolloClient } from "@apollo/client/react";

export const TasksRealtimeEvents: FC = () => {
  const { state } = useTasks();
  const client = useApolloClient();

  useEventsListener(
    [EventType.TASK_NEW],
    async (ev) => {
      if (!ev.ref) return;

      // const task = await client.query<TaskByIdQuery, TaskByIdQueryVariables>({
      //   query: QUERY_TASK_BY_ID,
      //   variables: {
      //     _id: ev.ref,
      //   },
      // });

      // console.log("task", task);
      console.log("ev");
    },
    [state]
  );

  return null;
};
