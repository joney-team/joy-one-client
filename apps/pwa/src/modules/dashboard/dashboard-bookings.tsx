"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { SectionTitle } from "@/components/session-title";
import { StorageKey } from "@/constants/storage-key";
import { EventType } from "@/graphql/enums.graphql";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { Period } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconAnalyze, IconClipboardList } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useRef } from "react";
import { bookingActiveStatus } from "../bookings/booking-constants";
import GetBookingsDocument from "../bookings/graphql/getBookings.graphql";
import type { ModalCancelBookingRef } from "../bookings/modals/modal-cancel-booking";
import type { ModalRescheduleBookingRef } from "../bookings/modals/modal-reschedule-booking";
import { useEventsListener } from "../events/event-service";

const ModalCancelBooking = dynamic(
  () => import("../bookings/modals/modal-cancel-booking").then((mod) => mod.ModalCancelBooking),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalRescheduleBooking = dynamic(
  () =>
    import("../bookings/modals/modal-reschedule-booking").then((mod) => mod.ModalRescheduleBooking),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const DashboardBookings: FC = () => {
  const modalCancelBookingRef = useRef<ModalCancelBookingRef>(null);
  const modalRescheduleBookingRef = useRef<ModalRescheduleBookingRef>(null);

  const [query, setQuery] = useLocalStorage({
    key: StorageKey.DASHBOARD_BOOKINGS_QUERY,
    defaultValue: { status: "in_progress", assigneeUserIds: [] as string[] },
  });

  const { data: todayBookings, refetch } = useQuery(GetBookingsDocument, {
    variables: {
      query: {
        timeRangeStartTime: `${Period.DATE}-${DateTime.toSeconds(new Date())}`,
        getAll: true,
      },
    },
  });

  useEventsListener(
    [
      EventType.BookingNew,
      EventType.BookingUpdated,
      EventType.BookingCheckin,
      EventType.BookingInProgress,
      EventType.BookingCompleted,
      EventType.BookingCancelled,
    ],
    () => {
      refetch();
    },
  );

  const bookingData = (todayBookings?.list.results || [])
    .filter((b) => {
      if (query.assigneeUserIds.length > 0)
        return query.assigneeUserIds.includes(b.assigneeUserIds?.[0] || "");
      return true;
    })
    .filter((b) => {
      if (query.status === "in_progress") return bookingActiveStatus.includes(b.status);
      return true;
    });

  if ((todayBookings?.list.total || 0) === 0) return null;

  return (
    <Stack>
      <SectionTitle id="dashboard-bookings" icon={IconClipboardList} name={t`Bookings`}>
        <Group gap={8} wrap="nowrap">
          <ButtonSelect
            icon={IconAnalyze}
            iconStyle={
              query.status === "in_progress" && bookingData.length > 0
                ? { animation: "symbolLoader 2s linear infinite" }
                : {}
            }
            label={query.status === "all" ? t`All` : t`Processing`}
            hideOptionLabel
            indicator={bookingData.length}
            onChange={(status) => setQuery((s: any) => ({ ...s, status: status }))}
            isActive={query.status === "in_progress"}
          />
        </Group>
      </SectionTitle>

      <Empty visible={bookingData.length === 0} />

      <SimpleGrid cols={{ md: 3, sm: 1 }}>
        {bookingData.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onCancel={() =>
              modalCancelBookingRef.current?.open({
                booking,
                onCancelled: () => {
                  refetch();
                },
              })
            }
            onReschedule={() =>
              modalRescheduleBookingRef.current?.open({
                booking,
                onRescheduled: () => {
                  refetch();
                },
              })
            }
          />
        ))}
      </SimpleGrid>

      <ModalCancelBooking ref={modalCancelBookingRef} />
      <ModalRescheduleBooking ref={modalRescheduleBookingRef} />
    </Stack>
  );
};
