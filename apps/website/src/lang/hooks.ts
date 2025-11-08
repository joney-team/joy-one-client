import { useRouter } from "next/router";
import { Locale } from "./types";
import { dictionaries } from "./dictionary";
import ReactHtmlParser from "html-react-parser";

export interface UseLang {
  locale: Locale;
  num: (value: number) => string;
  switchLocale: (locale?: Locale) => void;
  t: (key: string) => string;
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
    t: (key: string, params?: any) => {
      try {
        let sentence = dictionaries[key][_locale] || dictionaries[key][Locale.EN];

        if (params) {
          Object.keys(params).forEach((param) => {
            sentence = sentence.replace(`{${param}}`, params[param]);
          });
        }

        if (/<\/?[a-z][\s\S]*>/.test(sentence)) return ReactHtmlParser(sentence) as string;
        return sentence;
      } catch (error) {
        return key;
      }
    },
  };
};
