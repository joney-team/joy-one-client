import { Locale } from "./lang-types";
import { getCookie } from "cookies-next/client";
import { StorageKey } from "@/types";

export const getLocaleClient = () => {
  let locale: Locale | undefined = undefined;

  try {
    // Fallback to cookie
    const cookieLocale = getCookie(StorageKey.LOCALE);
    if (cookieLocale && Object.values(Locale).includes(cookieLocale as Locale)) {
      locale = cookieLocale as Locale;
    }

    // Fallback to browser language
    if (!locale && typeof navigator !== 'undefined' && navigator?.language) {
      navigator?.language.split('-').map((lang) => {
        if (Object.values(Locale).includes(lang as Locale)) {
          locale = lang as Locale;
        }
      });
    }
  } catch (error) {
    console.error(`Error getting locale: `, error);
  }

  return locale || Locale.EN;
}