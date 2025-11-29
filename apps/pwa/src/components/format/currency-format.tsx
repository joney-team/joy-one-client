"use client";

import { useLang } from "@/modules/lang/lang-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Currency } from "@joy-one-client/utils/currency";
import { FC, Fragment } from "react";

export interface CurrencyFormatProps {
  value: number;
}

export const CurrencyFormat: FC<CurrencyFormatProps> = (props) => {
  const workspace = useWorkspace();
  const lang = useLang();
  const { value } = props;

  return (
    <Fragment>
      {Currency.format(value, {
        locale: lang.locale,
        currency: workspace.settings.currencyCode,
      })}
    </Fragment>
  );
};
