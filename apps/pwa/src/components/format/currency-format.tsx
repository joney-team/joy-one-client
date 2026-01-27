"use client";

import { useLang } from "@/modules/lang/lang-context";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { Currency } from "@joy-one-client/utils/currency";
import { FC, Fragment } from "react";

export interface CurrencyFormatProps {
  value: number;
}

export const CurrencyFormat: FC<CurrencyFormatProps> = (props) => {
  const { workspaceSetting } = useWorkspaceSetting();
  const lang = useLang();
  const { value } = props;

  return (
    <Fragment>
      {Currency.format(value, {
        locale: lang.locale,
        currency: workspaceSetting?.currencyCode ?? "",
      })}
    </Fragment>
  );
};
