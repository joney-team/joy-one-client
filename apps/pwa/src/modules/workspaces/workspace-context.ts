import { createContext, useContext } from "react";
import { WorkspaceContext } from "./workspaces-types";

export const Context = createContext({} as WorkspaceContext);

export const useWorkspace = () => useContext(Context);
