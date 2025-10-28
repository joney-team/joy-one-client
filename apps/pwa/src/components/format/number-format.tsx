"use client";

import { useLang } from "@/modules/lang/lang-context";
import { getClientLocale } from "@/modules/lang/lang-service";
import { FC, Fragment } from "react";

export interface NumberFormatProps {
  value: number;
  suffix?: string;
  prefix?: string;
}

export const numberFormat = (value: number, props?: Omit<NumberFormatProps, "value">): string => {
  return `${props?.prefix || ""}${(+value).toLocaleString(getClientLocale())}${
    props?.suffix || ""
  }`.trim();
};

export const NumberFormat: FC<NumberFormatProps> = (props): JSX.Element => {
  const lang = useLang();
  const { value } = props;

  return (
    <Fragment>
      {props.prefix}
      {(+value).toLocaleString(lang.locale)}
      {props.suffix}
    </Fragment>
  );
};
