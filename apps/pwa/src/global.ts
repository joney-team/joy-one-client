import type { AppConfig, AppMetadata, ViewportType } from "./types";

export interface Global extends Window {
  FB: any;
  FBInitialized: boolean;
  electron: any;
  _appConfig: AppConfig;
  _metadata: AppMetadata;
  _sessionId: string;
  _view: ViewportType;
}

let serverGlobal = {} as Global;

export const getGlobal = (): Global => {
  if (typeof window === "undefined") return serverGlobal;
  return window as unknown as Global;
};
