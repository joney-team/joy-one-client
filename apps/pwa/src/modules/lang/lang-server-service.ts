"use server";

import { StorageKey } from "@/types";
import { getCookie } from "cookies-next/server";
import { cookies, headers } from "next/headers";
import { apiServerSide } from "../apis/server";
import { AppLocale } from "./lang-types";

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

  return locale || AppLocale.EN;
};

export const translateServer = async (
  id: string,
  args?: {
    params?: Record<string, any>;
    locale?: AppLocale;
  }
): Promise<string> => {
  try {
    const response = await apiServerSide.post<string>(
      `/lang/translate`,
      { id, params: args?.params },
      {
        headers: {
          "Accept-Language": args?.locale || (await getLocaleServer()),
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error translating server", error);
    return id;
  }
};
