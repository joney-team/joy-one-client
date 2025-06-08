import { AppLocale } from "@joy-one-client/apis/types/lang";

export const localeNames: Record<AppLocale, string> = {
  [AppLocale.VI]: "Tiếng Việt",
  [AppLocale.EN]: "English",
}

export const defaultDateFormatByLocales: { [key in AppLocale]: string } = {
  [AppLocale.VI]: 'DD/MM/YYYY',
  [AppLocale.EN]: 'MM/DD/YYYY',
}