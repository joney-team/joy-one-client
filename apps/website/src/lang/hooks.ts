import { useRouter } from "next/router";
import { Locale } from "./types";

export interface UseLang {
  locale: Locale;
  num: (value: number) => string;
  switchLocale: (locale?: Locale) => void;
}

export const localeNames = {
  [Locale.VI]: "Tiếng Việt",
  [Locale.EN]: "English",
};

export const useLang = (): UseLang => {
  const router = useRouter();
  const _locale = (router.locale || Locale.EN) as Locale;

  return {
    locale: _locale as Locale,
    num: (value: number) => {
      return (+value).toLocaleString(_locale);
    },
    switchLocale: (locale) => {
      if (locale) {
        router.push({ pathname: router.pathname, query: router.query }, undefined, { locale });
      } else {
        router.push({ pathname: router.pathname, query: router.query });
      }
    },
  };
};
