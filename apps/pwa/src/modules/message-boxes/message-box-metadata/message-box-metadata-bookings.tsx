"use client";

import { Empty } from "@/components/empty";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { useQuery } from "@apollo/client/react";
import { Stack } from "@mantine/core";
import { AccordionItemComponent } from "./message-box-metadata-types";

import QUERY_BOOKINGS from "@/modules/bookings/graphql/queryBookings.graphql";

export const MessageBoxMetadataBookings: AccordionItemComponent = ({ customer }) => {
  const { data } = useQuery(QUERY_BOOKINGS, {
    variables: {
      query: {
        customerId: customer._id,
      },
    },
  });

  const isEmpty = data && data.list && data.list.results && data.list.results.length === 0;

  return (
    <Stack>
      {isEmpty && <Empty hideBorder />}

      {data?.list.results.map((booking) => {
        return <BookingCard key={booking._id} booking={booking} withBorder shadow="none" />;
      })}
    </Stack>
  );
};
