"use client";

import { useLang } from "@/modules/lang/lang-context";
import { FC, Fragment } from "react";

export interface NumberFormatProps {
  value: number;
  suffix?: string;
  prefix?: string;
}

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
