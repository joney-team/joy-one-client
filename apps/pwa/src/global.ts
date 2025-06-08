import type { Dictionary, LangState, LocaleConfig } from "@/modules/lang/lang-types";
import type { WorkspaceSettingEntity } from "./modules/workspace-settings/workspace-settings-types";
import type { AppConfig, AppMetadata } from "./types";

export interface Global extends Window {
  appConfig: AppConfig;
  langState: LangState;
  _metadata: AppMetadata;
  sessionId: string;
  dictionary: Dictionary;
  localeConfig: LocaleConfig;
  FB: any;
  FBInitialized: boolean;
  electron: any;
  workspaceSettings: WorkspaceSettingEntity;
}

let serverGlobal = {} as Global;

export const getGlobal = (): Global => {
  if (typeof window === "undefined") return serverGlobal;
  return window as unknown as Global;
}