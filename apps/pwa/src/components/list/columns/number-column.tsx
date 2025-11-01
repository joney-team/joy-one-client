"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Text } from "@mantine/core";
import { Column } from "../types";

export interface NumberColumnOptions extends Omit<Column, "render"> {
  type?: "money" | "hours";
}

export const numberColumn = (options?: NumberColumnOptions): Column => {
  const name = options?.name || (options?.type === "money" ? "money_amount" : "number");
  const align = options?.align || "right";

  return {
    ...options,
    name,
    align,
    render: ({ value }) => {
      if (typeof value !== "number") return null;
      return (
        <Text ta={options?.align}>
          <NumberFormat value={value} />
        </Text>
      );
    },
    exportToExcel: (value) => {
      if (options?.type === "money") {
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
