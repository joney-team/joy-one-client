import { StorageKey } from "@/types";
import { getCookie } from "cookies-next/client";
import { AppLocale } from "./lang-types";

export const getClientLocale = (): AppLocale => {
  let locale: AppLocale | undefined = undefined;

  try {
    // Fallback to cookie
    const cookieLocale = getCookie(StorageKey.LOCALE);
    if (cookieLocale && Object.values(AppLocale).includes(cookieLocale as AppLocale)) {
      locale = cookieLocale as AppLocale;
    }

    // Fallback to browser language
    if (!locale && typeof navigator !== "undefined" && navigator?.language) {
      navigator?.language.split("-").map((lang) => {
        if (Object.values(AppLocale).includes(lang as AppLocale)) {
          locale = lang as AppLocale;
        }
      });
    }
  } catch (error) {
    console.error(`Error getting locale: `, error);
  }

  return locale || AppLocale.EN;
};

export const localeNames = {
  [AppLocale.VI]: "Tiếng Việt",
  [AppLocale.EN]: "English",
};
