"use client";

import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { useList } from "@/components/list/use-list";
import { SessionLoader } from "@/components/session-loader";
import { getBookings } from "@/modules/bookings/booking-service";
import { BookingEntity, BookingStatus } from "@/modules/bookings/booking-types";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { EventType } from "@/graphql/enums.graphql";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconCalendar, IconEye, IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { Renderer } from "../../../components/renderer";
import { SectionTitle } from "../../../components/session-title";

interface CustomerBookingsProps {
  customer: CustomerEntity;
  isViewAll?: boolean;
  cols?: number;
  withBorder?: boolean;
}

export const CustomerBookings: FC<CustomerBookingsProps> = (props) => {
  const { customer } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [total, setTotal] = useState(0);

  const bookings = useList<BookingEntity>({
    id: `customer-bookings-${customer._id}`,
    fetch: (p) =>
      getBookings({
        customerId: customer._id,
        status: isCollapsed
          ? [BookingStatus.JUST_CREATED, BookingStatus.IN_PROGRESS, BookingStatus.CHECK_IN]
          : undefined,
        ...p,
        orderStartTime: 1,
      }),
    events: [
      EventType.BookingNew,
      EventType.BookingUpdated,
      EventType.BookingCheckin,
      EventType.BookingInProgress,
      EventType.BookingCompleted,
      EventType.BookingCancelled,
    ],
  });

  const getTotals = async () => {
    getBookings({ offset: 0, limit: 1, customerId: customer._id, orderStartTime: 1 })
      .then((res) => setTotal(res.count))
      .catch(() => false);
  };

  useEffect(() => {
    getTotals();
  }, []);

  useEffect(() => {
    bookings.fetch(true);
  }, [isCollapsed]);

  return (
    <Stack className="customer-bookings" gap={10}>
      <SectionTitle name={<Trans>Bookings</Trans>} icon={IconCalendar}>
        <Renderer visible={total > 1 || (total === 1 && bookings.count === 0)}>
          <Group gap={0} onClick={() => setIsCollapsed((s) => !s)} style={{ cursor: "pointer" }}>
            <ActionIcon variant="transparent" color={isCollapsed ? "gray" : "primary"}>
              {isCollapsed ? (
                <IconEye strokeWidth={1.1} />
              ) : (
                <IconLayoutNavbarCollapse size={20} strokeWidth={1.1} />
              )}
            </ActionIcon>

            <Text fz={12} c={isCollapsed ? "gray" : "primary"} fw={400}>
              {isCollapsed ? <Trans>View all ({total})</Trans> : <Trans>Collapse</Trans>}
            </Text>
          </Group>
        </Renderer>
      </SectionTitle>

      <Empty visible={bookings.isEmpty} />
      <Errored error={bookings.error} visible={bookings.isHasError} />

      {bookings.count > 0 && (
        <SimpleGrid cols={props.cols || { md: 3 }}>
          {bookings.data.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              hideCustomerInfo
              withBorder={false}
              shadow="xs"
            />
          ))}
        </SimpleGrid>
      )}

      {bookings.isFetching && <SessionLoader />}

      {!isCollapsed && !bookings.isFetching && bookings.isAbleToLoadMore && (
        <ButtonViewMore onClick={() => bookings.fetch()} />
      )}
    </Stack>
  );
};
