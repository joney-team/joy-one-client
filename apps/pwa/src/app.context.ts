import { createContext, useContext } from "react";
import type { AppConfig, AppMetadata } from "./types";

export interface UseApp {
  isInitialized: boolean;
  config: AppConfig;
  metadata: AppMetadata;
  joinWorkspaceRoom: (workspaceId: string) => Promise<void>;
  joinSocket: () => Promise<void>;
}

export const AppContext = createContext<UseApp>({} as UseApp);
export const useApp = () => useContext(AppContext);