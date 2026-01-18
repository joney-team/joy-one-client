"use client";

import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { OrderCard } from "@/modules/orders/order-card";
import { useLayout } from "@/layout/layout-context";
import { getOrderByCode } from "@/modules/orders/orders-service";
import { useFetch } from "@/utils/use-fetch.util";
import { Skeleton } from "@mantine/core";
import { useParams } from "next/navigation";
import { Fragment, useEffect, type FC } from "react";
import { EventType } from "@/graphql/enums.graphql";
import dynamic from "next/dynamic";
import { nonLoading } from "@/utils/non-loading";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const OrderDetail: FC = () => {
  const params = useParams();
  const code = params.code as string;
  const layout = useLayout();

  const order = useFetch(
    {
      id: `orders-${code}`,
      fetch: () => getOrderByCode(code),
      refetchEvents: {
        types: [EventType.OrderSynced, EventType.OrderUpdated],
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
          <EventsList ref={order.data.id} />
        </Fragment>
      )}
    </Container>
  );
};
