"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Column } from "@/components/list/types";
import { OrderEntity } from "@/modules/orders/order-entity";
import { t } from "@lingui/core/macro";
import { Text } from "@mantine/core";

export const OrderItemsColumn: Column<OrderEntity, OrderEntity["items"]> = {
  name: t`Products/Services`,
  valuePath: "items",
  render: ({ data }) => {
    return (
      <Text>
        <NumberFormat value={data.items.length} />
      </Text>
    );
  },
};
