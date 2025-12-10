import { ModalHead } from "@/components/modal/modal-head";
import { t } from "@lingui/core/macro";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";
import { BookingEntity } from "../booking-types";
import { BookingForm } from "../components/form-booking";

export const OnModalUpdateBooking = (booking: BookingEntity) => {
  return modals.open({
    title: <ModalHead name={t`Update booking`} icon={IconCalendar} />,
    modalId: "UpdateBooking",
    size: 500,
    children: (
      <BookingForm
        key={`${booking._id}-update`}
        booking={booking}
        onFinished={() => modals.closeAll()}
        onCancel={() => modals.closeAll()}
      />
    ),
  });
};
