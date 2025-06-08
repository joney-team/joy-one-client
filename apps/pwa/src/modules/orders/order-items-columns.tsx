import { Column } from "@/components/list/types";
import { num } from "@/modules/lang/lang-service";
import { OrderEntity } from "@/modules/orders/order-entity";
import { Group, Text } from "@mantine/core";

export const OrderItemsColumn: Column<OrderEntity, OrderEntity["items"]> = {
  name: "order_items",
  valuePath: "items",
  render: ({ data }) => {
    return (
      <Group>
        <Text>{num(data.items.length)}</Text>
      </Group>
    );
  },
};
