import { ModalTitle } from "@/components/modal-title";
import { t } from "@lingui/core/macro";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";
import { BookingForm, BookingFormProps } from "../components/form-booking";

export const OnModalCreateBooking = (props?: Omit<BookingFormProps, "onFinished">) => {
  return modals.open({
    title: (
      <ModalTitle
        title={props?.reschedule ? t`Reschedule booking` : t`Create booking`}
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
