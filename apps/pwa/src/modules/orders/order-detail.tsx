"use client";

import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { EventList } from "@/components/event-list";
import { OrderCard } from "@/modules/orders/order-card";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
import { getOrderByCode } from "@/modules/orders/orders-service";
import { useFetch } from "@/utils/use-fetch.util";
import { Skeleton } from "@mantine/core";
import { useParams } from "next/navigation";
import { Fragment, useEffect, type FC } from "react";

export const OrderDetail: FC = () => {
  const params = useParams();
  const code = params.code as string;
  const layout = useLayout();

  const order = useFetch(
    {
      id: `orders-${code}`,
      fetch: () => getOrderByCode(code),
      events: {
        types: [EventType.ORDER_SYNCED, EventType.ORDER_UPDATED],
        condition: (e, _order) => {
          return e.ref === _order.id;
        },
      },
    },
    [code]
  );

  useEffect(() => {
    layout.setComponents({ head: code });
  }, [code]);

  return (
    <Container p={16}>
      {!order.isInitialized && <Skeleton height={150} />}

      {order.error && <Errored error={order.error} />}

      {order.data && (
        <Fragment>
          <OrderCard data={order.data} />
          <EventList ref={order.data.id} />
        </Fragment>
      )}
    </Container>
  );
};
