import { Empty } from "@/components/empty";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import QUERY_BOOKINGS from "@/modules/bookings/graphql/queryBookings.graphql";
import type { ModalCancelBookingRef } from "@/modules/bookings/modals/modal-cancel-booking";
import type { ModalRescheduleBookingRef } from "@/modules/bookings/modals/modal-reschedule-booking";
import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import { SimpleGrid, Skeleton, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { useRef } from "react";

const ModalCancelBooking = dynamic(
  () =>
    import("@/modules/bookings/modals/modal-cancel-booking").then((mod) => mod.ModalCancelBooking),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalRescheduleBooking = dynamic(
  () =>
    import("@/modules/bookings/modals/modal-reschedule-booking").then(
      (mod) => mod.ModalRescheduleBooking
    ),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const CustomerBookings = ({ customerId }: { customerId: string }) => {
  const modalCancelBookingRef = useRef<ModalCancelBookingRef>(null);
  const modalRescheduleBookingRef = useRef<ModalRescheduleBookingRef>(null);

  const { data, loading, refetch } = useQuery(QUERY_BOOKINGS, {
    variables: {
      query: {
        customerId,
      },
    },
  });

  const isEmpty = data && data.list && data.list.results && data.list.results.length === 0;

  return (
    <Stack>
      <SimpleGrid>
        {data?.list.results.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            hideCustomerInfo
            onCancel={() =>
              modalCancelBookingRef.current?.open({
                booking,
              })
            }
            onReschedule={() =>
              modalRescheduleBookingRef.current?.open({
                booking,
                onRescheduled: () => refetch(),
              })
            }
          />
        ))}

        {loading && <Skeleton height={115} />}
        {isEmpty && <Empty />}
      </SimpleGrid>

      <ModalCancelBooking ref={modalCancelBookingRef} />
      <ModalRescheduleBooking ref={modalRescheduleBookingRef} />
    </Stack>
  );
};
