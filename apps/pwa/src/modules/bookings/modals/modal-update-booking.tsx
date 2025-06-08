import { BookingForm } from "../booking-form";
import { ModalTitle } from "@/components/modal-title";
import { BookingEntity } from "../booking-types";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";

export const OnModalUpdateBooking = (booking: BookingEntity) => {
  return modals.open({
    title: <ModalTitle title="update_booking" icon={IconCalendar} />,
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
