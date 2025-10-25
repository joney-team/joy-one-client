"use client";

import { Anchor, Modal, Stack, ThemeIcon, Title, em } from "@mantine/core";
import { IconCalendar, IconEye, IconUser, IconUserScreen } from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";

import { useColor } from "@/modules/theme/use-color";
import { useRouter } from "@/hooks/use-router";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { Button } from "@/components/buttons/button";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { SessionTitle } from "@/components/session-title";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { tl } from "@/modules/lang/lang-service";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";

interface ModalBookingDetailProps {
  booking: BookingEntity;
}

export let OnModalBookingDetail: (props: ModalBookingDetailProps) => void = () => {};

export const ModalBookingDetail: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalBookingDetailProps>();
  const router = useRouter();
  const color = useColor();

  OnModalBookingDetail = (p) => {
    setProps(p);
    open();
  };

  const onClose = () => {
    close();
  };

  const onViewDetail = async () => {
    if (!props) return;
    if (props.booking.customer) {
      router.push(`/customers/${props.booking.customer.code}`);
    }
    onClose();
    modals.closeAll();
  };

  return (
    <Modal opened={opened} onClose={onClose} size="md" withCloseButton={false} yOffset={20}>
      {props?.booking && (
        <Stack>
          <Stack gap={16} mb={10}>
            <Stack gap={0} align="center">
              <ThemeIcon variant="subtle" radius={100} size={50} color={color("primary")}>
                <IconUserScreen size={45} strokeWidth={1.8} />
              </ThemeIcon>

              <Title fz={em(20)} fw={700} c={color("primary")} ta="center">
                {tl("booking_information")}
              </Title>
            </Stack>

            {props?.booking.customer && (
              <Fragment>
                <SessionTitle mb={-10} name={tl("customer")} icon={IconUser} />
                <CustomerCard
                  customer={props?.booking.customer}
                  withBorder
                  shadow="none"
                  onClick={() => {}}
                />
              </Fragment>
            )}

            <SessionTitle mb={-10} name={tl("booking")} icon={IconCalendar} />

            <BookingCard
              booking={props?.booking}
              hideCustomerInfo
              withBorder
              shadow="none"
              hideCtas
              onClick={() => {}}
            />

            <Stack justify="center" align="center" mt={10}>
              {props.booking.customer && (
                <Button leftIcon={IconEye} radius={100} onClick={onViewDetail}>
                  {tl("customer_detail")}
                </Button>
              )}

              <Anchor c="gray" fz={em(14)} onClick={onClose}>
                {tl("close")}
              </Anchor>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Modal>
  );
};
