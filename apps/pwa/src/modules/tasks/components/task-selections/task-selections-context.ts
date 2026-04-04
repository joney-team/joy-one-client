import { createContext, useContext } from "react";
import { GetTasksQuery, GetTasksQueryVariables } from "../../graphql/getTasks.graphql";

export type SelectedTask = Pick<
  GetTasksQuery["list"]["results"][number],
  "_id" | "parentId" | "statuses"
>;

export interface TasksSelectionContextType {
  selected: SelectedTask[];
  toggleSelect: (args: {
    task: SelectedTask;
    isShiftKey: boolean;
    groupVariables: GetTasksQueryVariables | null;
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
