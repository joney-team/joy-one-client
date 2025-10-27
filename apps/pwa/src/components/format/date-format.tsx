"use client";

import type { FC, JSX } from "react";
import { Fragment, useMemo } from "react";

import { useLang } from "@/modules/lang/lang-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { useAuth } from "@/modules/auth/auth-context";

type DateFormatProps = { value: Date | number | string } & (
  | {
      type?: "date" | "time" | "date-time";
      hour12?: boolean;
    }
  | { type: "custom"; format: Intl.DateTimeFormatOptions }
);

export const DateFormat: FC<DateFormatProps> = (props): JSX.Element => {
  const { locale } = useLang();
  const auth = useAuth();
  const hour12 = ("hour12" in props && props.hour12) ?? auth.user?.settings.isTwelveHour;

  const format = useMemo<Intl.DateTimeFormatOptions>(() => {
    if (props.type === "custom")
      return {
        locale,
        ...props.format,
      };

    if ("type" in props && props.type === "date") {
      return {
        locale,
        dateStyle: "short",
      };
    }

    if (props.type === "time") {
      return {
        locale,
        hour12,
        timeStyle: "short",
      };
    }

    return {
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
