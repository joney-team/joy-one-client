import type { Dictionary, LangState, LocaleConfig } from "@/modules/lang/lang-types";
import type { WorkspaceSettingEntity } from "./modules/workspace-settings/workspace-settings-types";
import type { AppConfig, AppMetadata, ViewportType } from "./types";

export interface Global extends Window {
  FB: any;
  FBInitialized: boolean;
  electron: any;
  _appConfig: AppConfig;
  _langState: LangState;
  _metadata: AppMetadata;
  _sessionId: string;
  _dictionary: Dictionary;
  _localeConfig: LocaleConfig;
  _workspaceSettings: WorkspaceSettingEntity;
  _view: ViewportType;
}

let serverGlobal = {} as Global;

export const getGlobal = (): Global => {
  if (typeof window === "undefined") return serverGlobal;
  return window as unknown as Global;
}