"use client";

import { Period } from "@/types";
import { getBookings } from "@/modules/bookings/booking-service";
import { BookingStatus } from "@/modules/bookings/booking-types";
import { t } from "@/modules/lang/lang-service";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import { IconAnalyze, IconClipboardList } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { SessionTitle } from "@/components/session-title";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { BookingCard } from "@/modules/bookings/components/booking-card";

export const DashboardBookings: FC = () => {
  const getInitialQuery = () => {
    const query = localStorage.getItem("dashboard-bookings-query");
    if (query) return JSON.parse(query);
    return { status: "in_progress", assigneeUserIds: [] as string[] };
  };

  const [query, setQuery] = useState(getInitialQuery());

  useEffect(() => {
    localStorage.setItem("dashboard-bookings-query", JSON.stringify(query));
  }, [query]);

  const bookings = useFetch({
    id: "next-booking",
    default: [],
    fetch: async () => {
      return getBookings({
        timeRangeStartTime: `${Period.DATE}-${DateTimeUtils.timeToSeconds()}`,
      }).then((r) =>
        r.data
          .filter((b) => {
            if (query.assigneeUserIds.length > 0)
              return query.assigneeUserIds.includes(b.assigneeUserIds?.[0] || "");
            return true;
          })
          .filter((b) => {
            if (query.status === "in_progress")
              return [
                BookingStatus.IN_PROGRESS,
                BookingStatus.CHECK_IN,
                BookingStatus.JUST_CREATED,
              ].includes(b.status);
            return true;
          })
      );
    },
  });

  const bookingData = bookings.data || [];

  if (bookingData.length === 0) return null;

  return (
    <Stack>
      <SessionTitle id="dashboard-bookings" icon={IconClipboardList} name="Bookings">
        <Group gap={8} wrap="nowrap">
          <ButtonSelect
            icon={IconAnalyze}
            iconStyle={
              query.status === "in_progress" && bookingData.length > 0
                ? { animation: "symbolLoader 2s linear infinite" }
                : {}
            }
            label={query.status === "all" ? t("all") : t("processing")}
            hideOptionLabel
            indicator={bookingData.length}
            onChange={(status) => setQuery((s: any) => ({ ...s, status: status }))}
            isActive={query.status === "in_progress"}
          />
        </Group>
      </SessionTitle>

      <Empty visible={bookingData.length === 0} />

      <SimpleGrid cols={{ md: 3, sm: 1 }}>
        {bookingData.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
