"use client";

import { ModalHead } from "@/components/modal/modal-head";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";
import { BookingForm } from "../components/form-booking";

export const OnModalRescheduleBooking = (booking: BookingEntity) => {
  return modals.open({
    title: <ModalHead name={<Trans>Reschedule booking</Trans>} icon={IconCalendar} />,
    modalId: "RescheduleBooking",
    size: 500,
    children: (
      <BookingForm
        key={`${booking._id}-reschedule`}
        reschedule={booking}
        onFinished={() => modals.closeAll()}
        onCancel={() => modals.closeAll()}
      />
    ),
  });
};
