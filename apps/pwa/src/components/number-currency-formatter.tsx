"use client";

import { currencies } from "@/configs/currency.config";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { round } from "@/utils/number.utils";
import { NumberFormatter, NumberFormatterProps } from "@mantine/core";
import { FC } from "react";

export const NumberCurrencyFormatter: FC<NumberFormatterProps & { value?: number }> = (props) => {
  const workspace = useWorkspace();

  let _props: NumberFormatterProps = { value: props.value || 0 };

  const currency = currencies.find((c) => c.code === workspace.settings.currencyCode);

  if (currency?.symbolPosition) {
    _props[currency.symbolPosition] = currency.symbol;
  }

  if (typeof currency?.roundPrecision === "number") {
    _props.value = round(props.value || 0, currency.roundPrecision);
  }

  return <NumberFormatter {..._props} />;
};
