import { createContext, useContext } from "react";
import { TaskMenuContextType } from "./task-menu-types";

export const TaskMenuContext = createContext<TaskMenuContextType>({
  open: () => {},
  setRoot: () => {},
  isOpened: false,
});

export const useTaskMenu = () => useContext(TaskMenuContext);
