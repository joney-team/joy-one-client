import { AppLocale } from "@/graphql/types.graphql";

export interface LangContext {
  locale: AppLocale;
  changeLocale: (locale: AppLocale | "default") => Promise<void>;
  isInitialized: boolean;
}
