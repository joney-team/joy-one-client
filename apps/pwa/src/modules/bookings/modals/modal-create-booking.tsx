import { BookingForm, BookingFormProps } from "../booking-form";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";

export const OnModalCreateBooking = (props?: Omit<BookingFormProps, "onFinished">) => {
  return modals.open({
    title: <ModalTitle title={props?.reschedule ? t("reschedule_booking") : t("create_booking")} icon={IconCalendar} />,
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
