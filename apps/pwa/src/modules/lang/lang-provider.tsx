"use client";

import { onReconnected } from "@/modules/events/event-service";
import { deleteCookie, setCookie } from "cookies-next/client";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { getLocaleClient } from "./lang-service";
import { LangState, Locale, LocaleConfig } from "./lang-types";
import { runWithDelay } from "@joy-one-client/utils/run-with-delay";

import dayjs from "dayjs";
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
import { getGlobal } from "../../global";
import { api } from "../apis";
import { setUserLocale } from "../users/users-service";
import { Context } from "./lang-context";

const LangProvider: FC<PropsWithChildren> = (props) => {
  const [locale, _setLocale] = useState(getLocaleClient());
  const [config, setConfig] = useState<LocaleConfig>({} as LocaleConfig);
  const [state, setState] = useState<LangState>({} as LangState);
  const global = getGlobal();
  global._langState = state;

  const weekStart = state.isStartOfWeekSunday ? 0 : 1;

  const fetchLocale = async (_locale: string) => {
    const { config, dictionary } = await new Promise<{ config: LocaleConfig; dictionary: any }>(
      (resolve) => {
        const action = () => {
          api
            .get(`/lang/${_locale}`)
            .then((res) => resolve(res))
            .catch(() => setTimeout(action, 3000));
        };

        action();
      }
    );

    const global = getGlobal();
    global._dictionary = dictionary;
    global._localeConfig = config;

    setConfig(config);
  };

  const initialize = async (_locale: Locale) => {
    try {
      await runWithDelay(() => fetchLocale(_locale), 1200);
    } catch (error) {
      console.error(error);
    } finally {
      _setLocale(_locale);
      endAppLoading("lang");
    }
  };

  const setLocale = async (locale: Locale | null = null, saveUserLocale = true) => {
    if (saveUserLocale) setUserLocale(locale);

    if (locale) setCookie(StorageKey.LOCALE, locale, { maxAge: 60 * 60 * 24 * 400 });
    else deleteCookie(StorageKey.LOCALE);

    startAppLoading("lang");
    await initialize(locale || getLocaleClient());
  };

  // Sync week start for all locales
  dayjs.locale(locale);
  Object.values(Locale).forEach((v) => dayjs.updateLocale(v, { weekStart }));

  // Reinitialize when reconnected
  onReconnected(() => initialize(getLocaleClient()), [locale]);

  // Initialize when component is mounted
  useEffect(() => {
    initialize(getLocaleClient());
  }, []);

  return (
    <Context.Provider
      value={{
        locale,
        config: config,
        setLocale,
        state,
        setState,
        weekStart,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default LangProvider;
