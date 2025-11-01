"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Column } from "@/components/list/types";
import { OrderEntity } from "@/modules/orders/order-entity";
import { t } from "@lingui/core/macro";
import { Text } from "@mantine/core";
import { IconStack2 } from "@tabler/icons-react";

export const OrderItemsColumn: Column<OrderEntity, OrderEntity["items"]> = {
  name: t`Products/Services`,
  defaultWidth: 300,
  icon: IconStack2,
  valuePath: "items",
  render: ({ data }) => {
    return (
      <Text>
        <NumberFormat value={data.items.length} />
      </Text>
    );
  },
};
