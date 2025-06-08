import { createContext, useContext } from "react";
import { TasksContext } from "./tasks-types";

export const Context = createContext({} as TasksContext);
export const useTasks = () => useContext(Context);
