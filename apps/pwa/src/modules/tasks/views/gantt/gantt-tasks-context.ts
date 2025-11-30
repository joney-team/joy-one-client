import { createContext, useContext } from "react";
import { UseGantt } from "./gantt-tasks-types";

export const Context = createContext({} as UseGantt);
export const useGantt = () => useContext(Context);
