"use client";

import { onReconnected } from "@/modules/events/event-service";
import { deleteCookie, setCookie } from "cookies-next/client";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { getLocaleClient } from "./lang-service";
import { LangState, Locale, LocaleConfig } from "./lang-types";

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

import { configs } from "@/configs/layout.config";
import { StorageKey } from "@/types";
import { wait } from "@/utils/common.utils";
import { getGlobal } from "../../global";
import { api } from "../apis";
import { setUserLocale } from "../users/users-service";
import { Context } from "./lang-context";

const LangProvider: FC<PropsWithChildren> = (props) => {
  const [locale, setLocale] = useState(getLocaleClient());
  const [_config, setConfig] = useState<LocaleConfig>({} as LocaleConfig);
  const [state, setState] = useState<LangState>({} as LangState);
  const global = getGlobal();
  global._langState = state;

  const weekStart = state.isStartOfWeekSunday ? 0 : 1;

  const fetch = async (_locale: string) => {
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
      await fetch(_locale);
    } catch (error) {
      console.error(error);
    } finally {
      setLocale(_locale);
    }
  };

  const _setLocale = async (locale: Locale | null = null, saveUserLocale = true) => {
    if (saveUserLocale) setUserLocale(locale);

    if (locale) setCookie(StorageKey.LOCALE, locale, { maxAge: configs.maxAgeCookie });
    else deleteCookie(StorageKey.LOCALE);

    await wait(100);
    window.location.reload();
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
        config: _config,
        setLocale: _setLocale,
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
