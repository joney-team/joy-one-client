"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { SectionTitle } from "@/components/session-title";
import { BookingEntity, BookingStatus } from "@/modules/bookings/booking-types";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { Period, ResponseList, StorageKey } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconAnalyze, IconClipboardList } from "@tabler/icons-react";
import { FC } from "react";
import { useQuery } from "../apis/use-query";
import { EventType } from "../events/event-types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";

export const DashboardBookings: FC = () => {
  const workspace = useWorkspace();

  const [query, setQuery] = useLocalStorage({
    key: StorageKey.DASHBOARD_BOOKINGS_QUERY,
    defaultValue: { status: "in_progress", assigneeUserIds: [] as string[] },
  });

  const todayBookings = useQuery<ResponseList<BookingEntity>>({
    route: "/bookings",
    isSkip: !workspace.hasPermission(WorkspacePermission.BOOKING_VIEW),
    params: {
      timeRangeStartTime: `${Period.DATE}-${DateTime.toSeconds(new Date())}`,
      getAll: true,
    },
    refetchEvents: [
      EventType.BOOKING_NEW,
      EventType.BOOKING_UPDATED,
      EventType.BOOKING_CHECKIN,
      EventType.BOOKING_IN_PROGRESS,
      EventType.BOOKING_COMPLETED,
      EventType.BOOKING_CANCELLED,
    ],
  });

  const bookingData = (todayBookings.data?.data || [])
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
    });

  if ((todayBookings.data?.count || 0) === 0) return null;

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
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
