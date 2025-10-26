"use client";

import type { FC, JSX } from "react";
import { Fragment } from "react";

import { useLang } from "@/modules/lang/lang-context";
import { DateTime } from "@joy-one-client/utils/date-time";

interface DateFormatProps {
  value: Date | number | string;
  format?: Intl.DateTimeFormatOptions;
}

export const DateFormat: FC<DateFormatProps> = (props): JSX.Element => {
  const lang = useLang();

  return (
    <Fragment>{DateTime.format(props.value, { ...props.format, locale: lang.locale })}</Fragment>
  );
};

export const RelativeTimeFormat: FC<DateFormatProps> = (props): JSX.Element => {
  const lang = useLang();
  return <Fragment>{DateTime.formatRelative(props.value, lang.locale)}</Fragment>;
};
