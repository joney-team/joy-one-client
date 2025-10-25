import { t } from "@lingui/core/macro";
import { ProductStockRecordType } from "./product-stocks-types";
import { MantineColor } from "@mantine/core";
import { Icon, IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react";

export const productStockRecordTypes: Record<
  ProductStockRecordType,
  { label: () => string; color: MantineColor; icon: Icon }
> = {
  [ProductStockRecordType.STOCK_IN]: {
    label: () => t`Stock in`,
    color: "green",
    icon: IconArrowDownLeft,
  },
  [ProductStockRecordType.STOCK_OUT]: {
    label: () => t`Stock out`,
    color: "red",
    icon: IconArrowUpRight,
  },
};
