"use client";

import { Group, Stack, ThemeIcon, Title } from "@mantine/core";
import { IconCalendar, IconCalendarMinus, IconEye } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useRef, useState } from "react";

import { Button } from "@/components/buttons/button";
import { Modal } from "@/components/modal/modal";
import { useRouter } from "@/hooks/use-router";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { useColor } from "@/modules/theme/use-color";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import dynamic from "next/dynamic";
import { BookingFragment } from "../graphql/fragmentBooking.graphql";

import type { ModalCancelBookingRef } from "./modal-cancel-booking";
import type { ModalRescheduleBookingRef } from "./modal-reschedule-booking";

const ModalRescheduleBooking = dynamic(
  () => import("./modal-reschedule-booking").then((mod) => mod.ModalRescheduleBooking),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCancelBooking = dynamic(
  () => import("./modal-cancel-booking").then((mod) => mod.ModalCancelBooking),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export interface ModalBookingDetailRef {
  open: (booking: BookingFragment) => void;
  close: () => void;
}

export const ModalBookingDetail = forwardRef<
  ModalBookingDetailRef,
  {
    children?: (open: (booking: BookingFragment) => void) => ReactNode;
  }
>((props, ref) => {
  const [booking, setBooking] = useState<BookingFragment | null>(null);
  const modalCancelBookingRef = useRef<ModalCancelBookingRef>(null);
  const modalRescheduleBookingRef = useRef<ModalRescheduleBookingRef>(null);

  const router = useRouter();
  const color = useColor();

  const onClose = () => {
    setBooking(null);
  };

  const onViewCustomerDetail = async () => {
    if (!booking) return;
    if (booking.customer) {
      router.push(`/customers/${booking.customer.code}`);
    }
    onClose();
    modals.closeAll();
  };

  useImperativeHandle(ref, () => ({
    open: (p) => {
      setBooking(p);
    },
    close: () => {
      setBooking(null);
    },
  }));

  return (
    <Fragment>
      {props.children?.((p) => {
        setBooking(p);
      })}

      <Modal opened={!!booking} onClose={onClose} withCloseButton={false}>
        <Stack gap="md">
          <Group justify="center" gap={4}>
            <ThemeIcon variant="transparent">
              <IconCalendar size={22} />
            </ThemeIcon>
            <Title fz="lg" fw={500} c={color("primary")} ta="center">
              <Trans>Booking information</Trans>
            </Title>
          </Group>

          {booking && (
            <Fragment>
              {booking?.customer && (
                <CustomerCard
                  customer={booking.customer}
                  withBorder
                  shadow="none"
                  onClick={onViewCustomerDetail}
                />
              )}

              <BookingCard booking={booking} hideCustomerInfo withBorder shadow="none" hideCtas />

              <Group justify="center" align="center" gap="xs" pt="xs">
                {booking.customer && (
                  <Button leftIcon={IconEye} variant="outline" onClick={onViewCustomerDetail}>
                    <Trans>Customer</Trans>
                  </Button>
                )}

                <Button
                  color="orange"
                  variant="outline"
                  leftIcon={IconCalendarMinus}
                  onClick={() =>
                    modalRescheduleBookingRef.current?.open({
                      booking,
                      onRescheduled: (booking) => setBooking(booking),
                    })
                  }
                >
                  <Trans>Reschedule booking</Trans>
                </Button>

                <Button
                  color="red"
                  variant="outline"
                  leftIcon={IconCalendarMinus}
                  onClick={() =>
                    modalCancelBookingRef.current?.open({ booking, onCancelled: onClose })
                  }
                >
                  <Trans>Cancel booking</Trans>
                </Button>

                <Button color="gray" variant="outline" onClick={onClose}>
                  <Trans>Close</Trans>
                </Button>
              </Group>
            </Fragment>
          )}
        </Stack>
      </Modal>

      <ModalCancelBooking ref={modalCancelBookingRef} />
      <ModalRescheduleBooking ref={modalRescheduleBookingRef} />
    </Fragment>
  );
});
