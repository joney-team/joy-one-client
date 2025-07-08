import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { SessionLoader } from "@/components/session-loader";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { getBookings } from "@/modules/bookings/booking-service";
import { BookingEntity, BookingStatus } from "@/modules/bookings/booking-types";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { EventType } from "@/modules/events/event-types";
import { num, t } from "@/modules/lang/lang-service";
import { useList } from "@/utils/use-list.util";
import { ActionIcon, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconCalendar, IconEye, IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { Renderer } from "../../../components/renderer";
import { SessionTitle } from "../../../components/session-title";

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
      EventType.BOOKING_NEW,
      EventType.BOOKING_UPDATED,
      EventType.BOOKING_CHECKIN,
      EventType.BOOKING_IN_PROGRESS,
      EventType.BOOKING_COMPLETED,
      EventType.BOOKING_CANCELLED,
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
      <SessionTitle name="Bookings" icon={IconCalendar}>
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
              {isCollapsed ? `${t("view_all")} (${num(total)})` : t("collapse")}
            </Text>
          </Group>
        </Renderer>
      </SessionTitle>

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
