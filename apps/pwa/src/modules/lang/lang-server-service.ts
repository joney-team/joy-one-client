import { StorageKey } from "@/types";
import { getCookie } from "cookies-next/server";
import { cookies, headers } from "next/headers";
import { api } from "../apis";
import { Locale } from "./lang-types";

export const getLocaleServer = async () => {
  let locale: Locale | undefined = undefined;
  const serLocale = await getCookie(StorageKey.LOCALE, { cookies });

  // Fallback to cookie
  if (serLocale && Object.values(Locale).includes(serLocale as Locale)) {
    locale = serLocale as Locale;
  }

  // Fallback to header
  if (!locale) {
    const headerLang = (await headers()).get('accept-language')?.split(';')[0].split(',')[1];
    if (headerLang && Object.values(Locale).includes(headerLang as Locale)) {
      locale = headerLang as Locale;
    }
  }

  return locale || Locale.EN;
}

export const translateServer = async (key: string, options?: { locale?: Locale, params?: any }): Promise<string> => {
  try {
    const locale = options?.locale || getLocaleServer();
    let sentence = (await api.get(`/lang/${locale}/${key}`)) || key;

    if (options?.params && typeof options.params === 'object') {
      Object.entries(options.params).map((item: any) => {
        sentence = sentence.replace(new RegExp(`{${item[0]}}`, 'g'), item[1])
      })
    }

    return sentence;
  } catch (error) {
    return key;
  }
}