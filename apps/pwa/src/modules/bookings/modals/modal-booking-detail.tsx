"use client";

import { Anchor, Modal, Stack, ThemeIcon, Title, em } from "@mantine/core";
import { IconCalendar, IconEye, IconUser, IconUserScreen } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";

import { Button } from "@/components/buttons/button";
import { SectionTitle } from "@/components/session-title";
import { useRouter } from "@/hooks/use-router";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";

interface ModalBookingDetailProps {
  booking: BookingEntity;
}

export const ModalBookingDetail: FC<{
  children: (open: (props: ModalBookingDetailProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalBookingDetailProps>();
  const router = useRouter();
  const color = useColor();

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
    <Fragment>
      {children((p) => {
        setProps(p);
        open();
      })}

      <Modal opened={opened} onClose={onClose} size="md" withCloseButton={false} yOffset={20}>
        {props?.booking && (
          <Stack>
            <Stack gap={16} mb={10}>
              <Stack gap={0} align="center">
                <ThemeIcon variant="subtle" radius={100} size={50} color={color("primary")}>
                  <IconUserScreen size={45} strokeWidth={1.8} />
                </ThemeIcon>

                <Title fz={em(20)} fw={700} c={color("primary")} ta="center">
                  <Trans>Booking information</Trans>
                </Title>
              </Stack>

              {props?.booking.customer && (
                <Fragment>
                  <SectionTitle mb={-10} name={<Trans>Customer</Trans>} icon={IconUser} />
                  <CustomerCard
                    customer={props?.booking.customer}
                    withBorder
                    shadow="none"
                    onClick={() => {}}
                  />
                </Fragment>
              )}

              <SectionTitle mb={-10} name={<Trans>Booking</Trans>} icon={IconCalendar} />

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
                    <Trans>Customer detail</Trans>
                  </Button>
                )}

                <Anchor c="gray" fz={em(14)} onClick={onClose}>
                  <Trans>Close</Trans>
                </Anchor>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Modal>
    </Fragment>
  );
};
