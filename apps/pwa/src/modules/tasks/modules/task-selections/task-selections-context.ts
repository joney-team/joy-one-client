import { createContext, useContext } from "react";
import { type TasksQueryVariables, type TasksQuery } from "../../graphql/queryTasks.graphql";

export type SelectedTask = Pick<
  TasksQuery["tasks"]["data"][number],
  "_id" | "parentId" | "statuses"
>;

export interface TasksSelectionContextType {
  selected: SelectedTask[];
  toggleSelect: (args: {
    task: SelectedTask;
    isShiftKey: boolean;
    groupVariables: TasksQueryVariables | null;
  }) => void;
  unselect: (...ids: string[]) => void;
}

export const TaskSelectionsContext = createContext<TasksSelectionContextType>({
  selected: [],
  toggleSelect: () => {},
  unselect: () => {},
});

export const useTaskSelections = () => {
  return useContext(TaskSelectionsContext);
};
