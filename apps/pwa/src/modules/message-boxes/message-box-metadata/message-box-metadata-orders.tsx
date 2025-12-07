import { useList } from "@/components/list/use-list";
import { AccordionItemComponent } from "./message-box-metadata-types";
import { getOrders } from "@/modules/orders/orders-service";
import { Stack } from "@mantine/core";
import { Empty } from "@/components/empty";
import { OrderCard } from "@/modules/orders/order-card";
import { EventType } from "@/graphql/enums.graphql";

export const MessageBoxMetadataOrders: AccordionItemComponent = ({ customer }) => {
  const orders = useList({
    fetch: async () => getOrders({ relatedCustomerId: customer._id }),
    events: [
      EventType.OrderNew,
      EventType.OrderUpdated,
      EventType.OrderArchived,
      EventType.OrderSynced,
    ],
  });

  return (
    <Stack>
      {orders.isEmpty && <Empty hideBorder />}

      {orders.data?.map((order) => {
        return (
          <OrderCard
            key={order.id}
            data={order}
            cardProps={{
              withBorder: true,
              shadow: "none",
            }}
          />
        );
      })}
    </Stack>
  );
};
