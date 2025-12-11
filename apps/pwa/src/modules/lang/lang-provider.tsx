"use client";

import { i18n as defaultI18n } from "@lingui/core";

import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/vi";

import updateLocale from "dayjs/plugin/updateLocale";

import { onReconnected } from "@/modules/events/event-service";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";
import { I18nProvider } from "@lingui/react";
import { deleteCookie, setCookie } from "cookies-next/client";

import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { getClientLocale } from "./lang-service";
import { AppLocale } from "./lang-types";

import { endAppLoading, startAppLoading } from "@/components/app-loading/app-loading";
import { StorageKey } from "@/types";
import { Context } from "./lang-context";

import { messages as defaultMessages } from "./catalog/en";

defaultI18n.load(getClientLocale(), defaultMessages);
defaultI18n.activate(getClientLocale());

dayjs.extend(updateLocale);
dayjs.locale(getClientLocale());

const LangProvider: FC<PropsWithChildren> = (props) => {
  const i18n = useRef(defaultI18n);

  const [locale, setLocale] = useState(getClientLocale());
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchLocale = async (activeLocale: AppLocale) => {
    const action = async () => {
      try {
        // Load translation catalog
        const txt = process.env.NODE_ENV === "development" ? "po" : "js";
        const catalog = await import(`@/modules/lang/catalog/${activeLocale}.${txt}`);
        i18n.current.load(activeLocale, catalog.messages);
        i18n.current.activate(activeLocale);

        // Sync week start for all locales
        dayjs.locale(activeLocale);
        Object.values(AppLocale).forEach((v) => dayjs.updateLocale(v, { weekStart: 1 }));
      } catch (error) {
        console.warn(`FetchLocale failed`, error);
        setTimeout(action, 3000);
      }
    };

    action();
  };

  const initialize = async (activeLocale: AppLocale) => {
    try {
      await runWithDelay(() => fetchLocale(activeLocale), 1000);
    } catch (error) {
      console.error(`Initialize lang failed`, error);
    } finally {
      setLocale(activeLocale);
      setIsInitialized(true);
      endAppLoading("lang");
    }
  };

  const changeLocale = async (locale: AppLocale | "default" = "default") => {
    if (locale === "default") {
      deleteCookie(StorageKey.LOCALE);
    } else {
      setCookie(StorageKey.LOCALE, locale, { maxAge: 60 * 60 * 24 * 400 });
    }

    await initialize(getClientLocale());
  };

  // Reinitialize when reconnected
  onReconnected(() => {
    initialize(getClientLocale());
  }, [locale]);

  // Initialize when component is mounted
  useEffect(() => {
    startAppLoading("lang");
    initialize(getClientLocale());
  }, []);

  return (
    <I18nProvider i18n={i18n.current}>
      <Context.Provider
        value={{
          locale,
          changeLocale,
          isInitialized,
        }}
      >
        {props.children}
      </Context.Provider>
    </I18nProvider>
  );
};

export default LangProvider;
