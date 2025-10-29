"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Column } from "@/components/list/types";
import { OrderEntity } from "@/modules/orders/order-entity";
import { Text } from "@mantine/core";

export const OrderItemsColumn: Column<OrderEntity, OrderEntity["items"]> = {
  name: "order_items",
  valuePath: "items",
  render: ({ data }) => {
    return (
      <Text>
        <NumberFormat value={data.items.length} />
      </Text>
    );
  },
};
