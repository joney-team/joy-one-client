"use server";

import { AppLocale } from "@/graphql/enums.graphql";
import { StorageKey } from "@/constants/storage-key";
import { getCookie } from "cookies-next/server";
import { cookies, headers } from "next/headers";

export const getLocaleServer = async () => {
  let locale: AppLocale | undefined = undefined;
  const serLocale = await getCookie(StorageKey.LOCALE, { cookies });

  // Fallback to cookie
  if (serLocale && Object.values(AppLocale).includes(serLocale as AppLocale)) {
    locale = serLocale as AppLocale;
  }

  // Fallback to header
  if (!locale) {
    const headerLang = (await headers()).get("accept-language")?.split(";")[0].split(",")[1];
    if (headerLang && Object.values(AppLocale).includes(headerLang as AppLocale)) {
      locale = headerLang as AppLocale;
    }
  }

  return locale || AppLocale.En;
};
