"use client";

import { useApolloClient } from "@apollo/client/react";
import { shiftSelect } from "@joy-one-client/utils/array";
import { FC, PropsWithChildren, useState } from "react";
import QUERY_TASKS, {
  type TasksQuery,
  type TasksQueryVariables,
} from "../../queries/queryTasks.graphql";
import {
  SelectedTask,
  TaskSelectionsContext,
  TasksSelectionContextType,
} from "./task-selections-context";

export const TaskSelectionsProvider: FC<PropsWithChildren> = ({ children }) => {
  const client = useApolloClient();

  const [selected, setSelected] = useState<SelectedTask[]>([]);

  const toggleSelectTask: TasksSelectionContextType["toggleSelect"] = (args) => {
    const { task, isShiftKey, groupVariables } = args;

    const data = client.cache.readQuery<TasksQuery, TasksQueryVariables>({
      query: QUERY_TASKS,
      variables: groupVariables ?? undefined,
    });

    if (isShiftKey && data) {
      const isSelected = selected.some((v) => v._id === task._id);
      if (isSelected) return;

      const relatedTasks = Array.from(data.tasks.data).sort((a, b) => a.order - b.order);
      const relatedSelectedTaskIds = selected
        .filter((t) => relatedTasks.some((v) => v._id === t._id))
        .map((t) => t._id);

      const selectedIds = shiftSelect(
        relatedTasks.map((t) => t._id),
        task._id,
        relatedSelectedTaskIds,
        relatedSelectedTaskIds[relatedSelectedTaskIds.length - 1] || null
      );

      return setSelected((s) => [
        ...s,
        ...relatedTasks.filter(
          (t) => selectedIds.includes(t._id) && !s.some((v) => v._id === t._id)
        ),
      ]);
    }

    return setSelected((prev) =>
      prev.some((v) => v._id === task._id)
        ? prev.filter((v) => v._id !== task._id)
        : [...prev, task]
    );
  };

  return (
    <TaskSelectionsContext.Provider
      value={{
        selected,
        toggleSelect: toggleSelectTask,
        unselect: (...ids) => setSelected((prev) => prev.filter((v) => !ids.includes(v._id))),
      }}
    >
      {children}
    </TaskSelectionsContext.Provider>
  );
};
