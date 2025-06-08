import { createContext, useContext } from "react";
import { TaskHistoriesContext } from "./tasks-types";

export const Context = createContext({} as TaskHistoriesContext);
export const useTaskHistories = () => useContext(Context);