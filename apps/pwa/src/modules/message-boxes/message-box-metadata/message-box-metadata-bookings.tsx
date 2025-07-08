import { BookingCard } from "@/modules/bookings/components/booking-card";
import { Empty } from "@/components/empty";
import { getBookings } from "@/modules/bookings/booking-service";
import { EventType } from "@/modules/events/event-types";
import { useList } from "@/utils/use-list.util";
import { Stack } from "@mantine/core";
import { AccordionItemComponent } from "./message-box-metadata-types";

export const MessageBoxMetadataBookings: AccordionItemComponent = ({ customer }) => {
  const bookings = useList({
    fetch: async () => getBookings({ customerId: customer._id }),
    events: [
      EventType.BOOKING_NEW,
      EventType.BOOKING_CANCELLED,
      EventType.BOOKING_CHECKIN,
      EventType.BOOKING_COMPLETED,
      EventType.BOOKING_IN_PROGRESS,
      EventType.BOOKING_UPDATED,
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
