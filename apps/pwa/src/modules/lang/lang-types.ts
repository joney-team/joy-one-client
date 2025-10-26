import { Dispatch, SetStateAction } from "react";

export enum Locale {
  VI = "vi",
  EN = "en",
}

export type Dictionary = {
  [key: string]: string;
};

export interface LangContext {
  locale: Locale;
  config: LocaleConfig;
  state: LangState;
  setLocale: (locale?: Locale, saveUserLocale?: boolean) => Promise<void>;
  setState: Dispatch<SetStateAction<LangState>>;
  weekStart: number;
  isInitialized: boolean;
}

export interface LocaleConfig {
  dayWeekNames: string[];
  dayWeekShortNames: string[];
  dateFormat: string;
  dateTimeFormat: string;
  name: string;
  defaultNumberInputProps: {
    decimalSeparator: string;
    thousandSeparator: string;
  };
  roundPrecision?: number;
  defaultCurrency?: string;
}

export type LangConfigs = {
  [key in Locale]: LocaleConfig;
};

export interface LangState {
  timezone?: string;
  isStartOfWeekSunday?: boolean;
  isTwelveHour?: boolean;
  dateFormat?: string;
}
