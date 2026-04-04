import { Empty } from "@/components/empty";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { EventType } from "@/graphql/enums.graphql";
import { OrderFragment } from "@/modules/orders/graphql/fragmentOrder.graphql";
import GetOrdersDocument from "@/modules/orders/graphql/getOrders.graphql";
import { OrderCard } from "@/modules/orders/order-card";
import { Stack } from "@mantine/core";
import { AccordionItemComponent } from "./message-box-metadata-types";

export const MessageBoxMetadataOrders: AccordionItemComponent = ({ customer }) => {
  const orders = useGraphqlList<OrderFragment>({
    query: GetOrdersDocument,
    params: {
      relatedCustomerId: customer._id,
    },
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
