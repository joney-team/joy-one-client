import { ProductStockRecordType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { Icon, IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react";

export const productStockRecordTypes: Record<
  ProductStockRecordType,
  { label: MacroMessageDescriptor; color: MantineColor; icon: Icon }
> = {
  [ProductStockRecordType.StockIn]: {
    label: defineMessage`Stock in`,
    color: "green",
    icon: IconArrowDownLeft,
  },
  [ProductStockRecordType.StockOut]: {
    label: defineMessage`Stock out`,
    color: "red",
    icon: IconArrowUpRight,
  },
};
