export enum AppLocale {
  VI = "vi",
  EN = "en",
}

export interface LangContext {
  locale: AppLocale;
  changeLocale: (locale: AppLocale | "default") => Promise<void>;
  isInitialized: boolean;
}
