import { createContext, useContext } from "react";
import { UsePlugins } from "./plugins-types";

export const Context = createContext({} as UsePlugins);
export const usePlugins = () => useContext(Context);
