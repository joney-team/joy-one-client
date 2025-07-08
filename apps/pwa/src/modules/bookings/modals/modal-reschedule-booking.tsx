import { BookingForm } from "../components/form-booking";
import { ModalTitle } from "@/components/modal-title";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";

export const OnModalRescheduleBooking = (booking: BookingEntity) => {
  return modals.open({
    title: <ModalTitle title="reschedule_booking" icon={IconCalendar} />,
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
