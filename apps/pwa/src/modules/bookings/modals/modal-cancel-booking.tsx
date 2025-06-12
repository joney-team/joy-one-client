import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { cancelBooking } from "@/modules/bookings/booking-service";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCalendarMinus } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ModalCancelBookingProps {
  booking: BookingEntity;
}

export const ModalCancelBooking: FC<ModalCancelBookingProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    validate: {
      reasonForCancellation: (value) => {
        if (!value) return "Vui lòng nhập lý do huỷ booking";
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await cancelBooking(props.booking._id, values.reasonForCancellation);
      modals.close("cancel-booking");
    } catch (error) {
      onError(error);
    }
    setIsSubmitting(false);
  });

  return (
    <Stack>
      <Textarea withAsterisk label="Lý do huỷ" {...form.getInputProps("reasonForCancellation")} />

      <Button loading={isSubmitting} onClick={onSubmit} color="red" type="submit">
        Xác nhận huỷ
      </Button>
    </Stack>
  );
};

export const OnModalCancelBooking = (props: ModalCancelBookingProps) => {
  return modals.open({
    modalId: "cancel-booking",
    title: <ModalTitle color="red" title="Huỷ hẹn" icon={IconCalendarMinus} />,
    children: <ModalCancelBooking {...props} />,
    zIndex: zIndexes.modals,
  });
};
