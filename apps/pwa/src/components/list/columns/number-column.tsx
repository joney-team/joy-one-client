import { Text } from "@mantine/core";
import { num } from "@/modules/lang/lang-service";
import { Column } from "../types";

export interface NumberColumnOptions extends Omit<Column, "render"> {
  type?: "money" | "hours";
}

export const NumberColumn = (options?: NumberColumnOptions): Column => {
  const name = options?.name || (options?.type === "money" ? "money_amount" : "number");
  const align = options?.align || "right";

  return {
    ...options,
    name,
    align,
    render: ({ value }) => {
      if (typeof value !== "number") return null;
      return <Text ta={options?.align}>{num(value, { type: options?.type })}</Text>;
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
