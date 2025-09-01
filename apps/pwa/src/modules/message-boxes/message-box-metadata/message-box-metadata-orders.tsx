import { useList } from "@/components/list/use-list";
import { AccordionItemComponent } from "./message-box-metadata-types";
import { getOrders } from "@/modules/orders/orders-service";
import { EventType } from "@/modules/events/event-types";
import { Stack } from "@mantine/core";
import { Empty } from "@/components/empty";
import { OrderCard } from "@/modules/orders/order-card";

export const MessageBoxMetadataOrders: AccordionItemComponent = ({ customer }) => {
  const orders = useList({
    fetch: async () => getOrders({ relatedCustomerId: customer._id }),
    events: [
      EventType.ORDER_NEW,
      EventType.ORDER_UPDATED,
      EventType.ORDER_ARCHIVED,
      EventType.ORDER_SYNCED,
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
