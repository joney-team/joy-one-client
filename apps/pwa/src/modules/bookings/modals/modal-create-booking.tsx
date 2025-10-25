import { BookingForm, BookingFormProps } from "../components/form-booking";
import { ModalTitle } from "@/components/modal-title";
import { tl } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";

export const OnModalCreateBooking = (props?: Omit<BookingFormProps, "onFinished">) => {
  return modals.open({
    title: (
      <ModalTitle
        title={props?.reschedule ? tl("reschedule_booking") : tl("create_booking")}
        icon={IconCalendar}
      />
    ),
    modalId: "CreateBooking",
    size: 500,
    children: (
      <BookingForm
        {...props}
        onFinished={() => modals.close("CreateBooking")}
        onCancel={() => modals.close("CreateBooking")}
      />
    ),
  });
};
