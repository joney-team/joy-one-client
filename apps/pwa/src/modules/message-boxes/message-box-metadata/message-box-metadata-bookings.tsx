"use client";

import { Empty } from "@/components/empty";
import { useList } from "@/components/list/use-list";
import { EventType } from "@/graphql/enums.graphql";
import { getBookings } from "@/modules/bookings/booking-service";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { Stack } from "@mantine/core";
import { AccordionItemComponent } from "./message-box-metadata-types";

export const MessageBoxMetadataBookings: AccordionItemComponent = ({ customer }) => {
  const bookings = useList({
    fetch: async () => getBookings({ customerId: customer._id }),
    events: [
      EventType.BookingNew,
      EventType.BookingCancelled,
      EventType.BookingCheckin,
      EventType.BookingCompleted,
      EventType.BookingInProgress,
      EventType.BookingUpdated,
    ],
  });

  return (
    <Stack>
      {bookings.isEmpty && <Empty hideBorder />}

      {bookings.data?.map((booking) => {
        return <BookingCard key={booking._id} booking={booking} withBorder shadow="none" />;
      })}
    </Stack>
  );
};
