import { Button } from "@/components/buttons/button";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Anchor, Center, Modal, Stack, ThemeIcon, Title, em } from "@mantine/core";
import { IconEye, IconUserScreen } from "@tabler/icons-react";

import { BookingCard } from "@/modules/bookings/components/booking-card";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { Period } from "@/types";
import { getBookings } from "@/modules/bookings/booking-service";
import { BookingStatus } from "../booking-types";
import { DateTime } from "@/utils/date-time.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { useDisclosure, useForceUpdate } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { useColor } from "../../theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";

export function setBookingReaded(bookingId: string) {
  const readedBookings = (localStorage.getItem("readed_bookings") || "").split(",");
  const maxLength = 10;
  localStorage.setItem(
    "readed_bookings",
    [bookingId, ...readedBookings.filter((b) => b !== bookingId).slice(0, maxLength - 1)].toString()
  );
}

export const ModalNextBooking: FC = () => {
  const workspace = useWorkspace();
  const forceUpdate = useForceUpdate();
  const router = useRouter();

  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();

  const readedBookings = (localStorage.getItem("readed_bookings") || "").split(",");

  const relatedBookings = useFetch({
    skip: !workspace.hasPermission(WorkspacePermission.BOOKING_VIEW),
    id: "next-booking",
    default: [],
    fetch: async () => {
      return getBookings({
        timeRangeStartTime: `${Period.DATE}-${DateTime.timeToSeconds()}`,
      }).then((r) =>
        r.data.filter(
          (b) =>
            b.assigneeUserIds?.includes(workspace.userMember.userId) &&
            b.status === BookingStatus.IN_PROGRESS &&
            !readedBookings.includes(b._id)
        )
      );
    },
  });

  const booking = relatedBookings.data?.[0];

  const onClose = () => {
    close();

    if (booking) {
      setBookingReaded(booking._id);
      forceUpdate();
    }
  };

  const onViewDetail = async () => {
    if (booking && booking.customer) {
      router.push(`/customers/${booking.customer.code}`);
      onClose();
    }
  };

  useEffect(() => {
    if (relatedBookings.data?.length) {
      open();
    }
  }, [relatedBookings.data?.length]);

  useEffect(() => {
    if (opened && !booking) {
      close();
    }
  }, [booking, opened]);

  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false}>
      {booking && (
        <Stack gap={16}>
          <Center>
            <ThemeIcon variant="transparent" radius={100} size={40}>
              <IconUserScreen size={40} strokeWidth={1.4} />
            </ThemeIcon>
          </Center>

          <Title mt={-10} fz={em(20)} fw={500} c={color("primary")} ta="center">
            Khách Hàng Tiếp Theo
          </Title>

          {booking.customer && (
            <CustomerCard customer={booking.customer} withBorder shadow="none" onClick={() => {}} />
          )}

          <BookingCard
            booking={booking}
            hideCustomerInfo
            withBorder
            shadow="none"
            hideCtas
            onClick={() => {}}
          />

          <Stack justify="center" align="center">
            <Button
              mt={10}
              leftSection={<IconEye strokeWidth={1.2} />}
              radius={100}
              w={200}
              fw={400}
              onClick={onViewDetail}
            >
              Xem Chi Tiết
            </Button>

            <Anchor c="gray" fz={em(15)} onClick={onClose}>
              Đóng lại
            </Anchor>
          </Stack>
        </Stack>
      )}
    </Modal>
  );
};
