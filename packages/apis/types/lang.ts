export enum AppLocale {
  VI = 'vi',
  EN = 'en',
}

export interface LocaleConfig {
  dayWeekNames: string[],
  dayWeekShortNames: string[],
  dateFormat: string,
  dateTimeFormat: string,
  name: string,
  defaultNumberInputProps: {
    decimalSeparator: string,
    thousandSeparator: string,
  },
  roundPrecision?: number,
  defaultCurrency?: string,
}

export interface AppDictionary {
  config: LocaleConfig,
  dictionary: Record<string, string>
}