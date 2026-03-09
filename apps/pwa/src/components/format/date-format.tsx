"use client";

import type { FC, JSX } from "react";
import { Fragment, useMemo } from "react";

import { useAuth } from "@/modules/auth/auth-context";
import { useLang } from "@/modules/lang/lang-context";
import { DateTime, RawDate } from "@joy-one-client/utils/date-time";

type DateFormatProps = { value: RawDate } & (
  | {
      type?: "date" | "time" | "date-time";
      hour12?: boolean;
    }
  | { type: "custom"; format: Intl.DateTimeFormatOptions }
);

export const useCurrentTimeZone = () => {
  const auth = useAuth();
  const fallback = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  return auth.user?.settings?.timezoneUtc ?? fallback;
};

export const DateFormat: FC<DateFormatProps> = (props): JSX.Element => {
  const { locale } = useLang();
  const auth = useAuth();
  const timeZone = useCurrentTimeZone();
  const hour12 = ("hour12" in props && props.hour12) ?? auth.user?.settings?.isTwelveHour ?? false;

  const format = useMemo<Intl.DateTimeFormatOptions>(() => {
    if (props.type === "custom")
      return {
        timeZone,
        locale,
        ...props.format,
      };

    if ("type" in props && props.type === "date") {
      return {
        timeZone,
        locale,
        month: "2-digit",
        year: "numeric",
        day: "2-digit",
      };
    }

    if (props.type === "time") {
      return {
        timeZone,
        locale,
        hour12,
        timeStyle: "short",
      };
    }

    return {
      timeZone,
      locale,
      hour12,
      dateStyle: "short",
      timeStyle: "short",
    };
  }, [locale, props]);

  return <Fragment>{DateTime.format(props.value, format)}</Fragment>;
};

export const RelativeTimeFormat: FC<DateFormatProps> = (props): JSX.Element => {
  const lang = useLang();
  return <Fragment>{DateTime.formatRelative(props.value, lang.locale)}</Fragment>;
};
