import { createContext, useContext } from "react";
import { TaskEntity } from "../../tasks-types";

interface ListTaskViewContext {
  tasks: TaskEntity[];
  updateTasks: (tasks: TaskEntity[]) => void;
  selectedTaskIds: string[];
  toggleSelectTask: (taskId: string, isShiftKey?: boolean) => void;
  draggingId: string | null;
}

export const Context = createContext({} as ListTaskViewContext);
export const useListTaskView = () => useContext(Context);
