import { ModalHead } from "@/components/modal/modal-head";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";
import { BookingForm } from "../components/form-booking";
import { BookingFragment } from "../graphql/fragmentBooking.graphql";

export const OnModalUpdateBooking = (booking: BookingFragment) => {
  return modals.open({
    title: <ModalHead name={<Trans>Update booking</Trans>} icon={IconCalendar} />,
    modalId: "UpdateBooking",
    size: 500,
    children: (
      <BookingForm
        key={booking._id}
        update={booking}
        onFinished={() => modals.closeAll()}
        onCancel={() => modals.closeAll()}
      />
    ),
  });
};
