import { createContext, useContext } from "react";
import type { AppConfigFragment } from "./configs/fragmentAppConfig.graphql";
import type { AppMetadata } from "./types";

export interface UseApp {
  isInitialized: boolean;
  config: AppConfigFragment;
  metadata: AppMetadata;
  joinWorkspaceRoom: (workspaceId: string) => Promise<void>;
  joinSocket: () => Promise<void>;
}

export const AppContext = createContext<UseApp>({} as UseApp);
export const useApp = () => useContext(AppContext);
