"use client";

import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { OrderCard } from "@/modules/orders/order-card";
import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import { Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Fragment, type FC } from "react";
import GetOrderByCodeDocument from "./graphql/getOrderByCode.graphql";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const OrderDetail: FC = () => {
  const params = useParams<{ code: string }>();

  const { data, loading, error } = useQuery(GetOrderByCodeDocument, {
    variables: { code: params.code },
  });

  return (
    <Container p="md">
      {loading && !data && <Skeleton height={150} />}

      {error && <Errored error={error} />}

      {data && (
        <Fragment>
          <OrderCard data={data.getOrderByCode} />
          <EventsList ref={data.getOrderByCode.id} />
        </Fragment>
      )}
    </Container>
  );
};
