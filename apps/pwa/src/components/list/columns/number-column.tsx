"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Text } from "@mantine/core";
import { Column } from "../types";
import { t } from "@lingui/core/macro";
import { CurrencyFormat } from "@/components/format/currency-format";
import { Trans } from "@lingui/react/macro";

export interface NumberColumnOptions extends Omit<Column, "render"> {
  type?: "money" | "hours";
}

export const numberColumn = (args?: NumberColumnOptions): Column => {
  const name =
    args?.name || (args?.type === "money" ? <Trans>Money amount</Trans> : <Trans>Number</Trans>);
  const align = args?.align || "right";

  return {
    ...args,
    name,
    align,
    render: ({ value }) => {
      if (typeof value !== "number") return null;

      if (args?.type === "money") {
        return (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            <CurrencyFormat value={value} />
          </span>
        );
      }

      return (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          <NumberFormat value={value} />
        </span>
      );
    },
    exportToExcel: (value) => {
      if (args?.type === "money") {
        return {
          money: value,
        };
      }

      return {
        number: value,
      };
    },
  };
};
