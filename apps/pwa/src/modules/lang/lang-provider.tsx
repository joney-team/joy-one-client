"use client";

import { onReconnected } from "@/modules/events/event-service";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";
import { I18nProvider } from "@lingui/react";
import { deleteCookie, setCookie } from "cookies-next/client";
import dayjs from "dayjs";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { getClientLocale } from "./lang-service";
import { Dictionary, LangState, Locale, LocaleConfig } from "./lang-types";

import "dayjs/locale/en";
import "dayjs/locale/vi";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(updateLocale);

import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import { endAppLoading, startAppLoading } from "@/components/app-loading/app-loading";
import { StorageKey } from "@/types";
import { i18n as defaultI18n } from "@lingui/core";
import { getGlobal } from "../../global";
import { api } from "../apis";
import { Context } from "./lang-context";

defaultI18n.load(getClientLocale(), {});
defaultI18n.activate(getClientLocale());

const LangProvider: FC<PropsWithChildren> = (props) => {
  const i18n = useRef(defaultI18n);

  const [locale, _setLocale] = useState(getClientLocale());
  const [config, setConfig] = useState<LocaleConfig>({} as LocaleConfig);
  const [state, setState] = useState<LangState>({} as LangState);
  const [isInitialized, setIsInitialized] = useState(false);
  const global = getGlobal();
  global._langState = state;

  const weekStart = state.isStartOfWeekSunday ? 0 : 1;

  const fetchLocale = async (activeLocale: string) => {
    const { config, dictionary } = await new Promise<{
      config: LocaleConfig;
      dictionary: Dictionary;
    }>((resolve) => {
      const action = async () => {
        try {
          const txt = process.env.NODE_ENV === "development" ? "po" : "js";
          const catalog = await import(`@/modules/lang/catalog/${activeLocale}.${txt}`);
          i18n.current.load(activeLocale, catalog.messages);
          i18n.current.activate(activeLocale);

          await api.get(`/lang/${activeLocale}`).then((res) => resolve(res));
        } catch (error) {
          console.warn(`FetchLocale failed`, error);
          setTimeout(action, 3000);
        }
      };

      action();
    });

    const global = getGlobal();
    global._dictionary = dictionary;
    global._localeConfig = config;

    setConfig(config);
  };

  const initialize = async (activeLocale: Locale) => {
    try {
      await runWithDelay(() => fetchLocale(activeLocale), 1200);
    } catch (error) {
      console.error(error);
    } finally {
      _setLocale(activeLocale);
      setIsInitialized(true);
      endAppLoading("lang");
    }
  };

  const setLocale = async (locale: Locale | null = null) => {
    if (locale) setCookie(StorageKey.LOCALE, locale, { maxAge: 60 * 60 * 24 * 400 });
    else deleteCookie(StorageKey.LOCALE);

    startAppLoading("lang");
    await initialize(getClientLocale());
  };

  // Sync week start for all locales
  dayjs.locale(locale);
  Object.values(Locale).forEach((v) => dayjs.updateLocale(v, { weekStart }));

  // Reinitialize when reconnected
  onReconnected(() => initialize(getClientLocale()), [locale]);

  // Initialize when component is mounted
  useEffect(() => {
    initialize(getClientLocale());
  }, []);

  return (
    <I18nProvider i18n={i18n.current}>
      <Context.Provider
        value={{
          locale,
          config,
          setLocale,
          state,
          setState,
          weekStart,
          isInitialized,
        }}
      >
        {props.children}
      </Context.Provider>
    </I18nProvider>
  );
};

export default LangProvider;
