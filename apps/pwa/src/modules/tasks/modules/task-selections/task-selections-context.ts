import { createContext, useContext } from "react";
import { type TasksQueryVariables, type TasksQuery } from "../../queries/queryTasks.graphql";

export type SelectedTask = Pick<TasksQuery["tasks"]["data"][number], "_id" | "parentId">;

export interface TasksSelectionContextType {
  selected: SelectedTask[];
  toggleSelect: (args: {
    task: SelectedTask;
    isShiftKey: boolean;
    groupVariables: TasksQueryVariables | null;
  }) => void;
}

export const TaskSelectionsContext = createContext<TasksSelectionContextType>({
  selected: [],
  toggleSelect: () => {},
});

export const useTaskSelections = () => {
  return useContext(TaskSelectionsContext);
};
