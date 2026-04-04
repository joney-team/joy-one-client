"use client";

import { nonLoading } from "@/utils/non-loading";
import { useApolloClient } from "@apollo/client/react";
import { shiftSelect } from "@joy-one-client/utils/array";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import GetTasksDocument from "../../graphql/getTasks.graphql";
import {
  SelectedTask,
  TaskSelectionsContext,
  TasksSelectionContextType,
} from "./task-selections-context";

const TaskSelectionMenu = dynamic(
  () => import("./task-selection-menu").then((mod) => mod.TaskSelectionMenu),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const TaskSelectionsProvider: FC<PropsWithChildren> = ({ children }) => {
  const client = useApolloClient();

  const [selected, setSelected] = useState<SelectedTask[]>([]);

  const toggleSelectTask: TasksSelectionContextType["toggleSelect"] = (args) => {
    const { task, isShiftKey, groupVariables } = args;

    const data = client.cache.readQuery({
      query: GetTasksDocument,
      variables: groupVariables ?? undefined,
    });

    if (isShiftKey && data) {
      const isSelected = selected.some((v) => v._id === task._id);
      if (isSelected) return;

      const relatedTasks = Array.from(data.list.results).sort((a, b) => a.order - b.order);
      const relatedSelectedTaskIds = selected
        .filter((t) => relatedTasks.some((v) => v._id === t._id))
        .map((t) => t._id);

      const selectedIds = shiftSelect(
        relatedTasks.map((t) => t._id),
        task._id,
        relatedSelectedTaskIds,
        relatedSelectedTaskIds[relatedSelectedTaskIds.length - 1] || null,
      );

      return setSelected((s) => [
        ...s,
        ...relatedTasks.filter(
          (t) => selectedIds.includes(t._id) && !s.some((v) => v._id === t._id),
        ),
      ]);
    }

    return setSelected((prev) =>
      prev.some((v) => v._id === task._id)
        ? prev.filter((v) => v._id !== task._id)
        : [...prev, task],
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        document.body.classList.add("ShiftSelect");
      } else {
        document.body.classList.remove("ShiftSelect");
      }
    };

    const onKeyUp = () => {
      document.body.classList.remove("ShiftSelect");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <TaskSelectionsContext.Provider
      value={{
        selected,
        toggleSelect: toggleSelectTask,
        unselect: (...ids) => setSelected((prev) => prev.filter((v) => !ids.includes(v._id))),
      }}
    >
      {children}
      <TaskSelectionMenu />
    </TaskSelectionsContext.Provider>
  );
};
