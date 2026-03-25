"use client";

import { Modal } from "@/components/modal/modal";
import { Trans } from "@lingui/react/macro";
import { IconCalendar } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { BookingForm } from "../components/form-booking";
import { BookingFragment } from "../graphql/fragmentBooking.graphql";

type RescheduleBookingArgs = {
  booking: BookingFragment;
  onRescheduled?: (booking: BookingFragment) => void;
};

export interface ModalRescheduleBookingRef {
  open: (args: RescheduleBookingArgs) => void;
  close: () => void;
}

export const ModalRescheduleBooking = forwardRef<ModalRescheduleBookingRef>((_, ref) => {
  const [args, setArgs] = useState<RescheduleBookingArgs | null>(null);

  const onClose = () => {
    setArgs(null);
  };

  useImperativeHandle(ref, () => ({
    open: (p) => {
      setArgs(p);
    },
    close: () => {
      setArgs(null);
    },
  }));

  return (
    <Modal
      opened={!!args}
      onClose={onClose}
      name={<Trans>Reschedule booking</Trans>}
      icon={IconCalendar}
    >
      {args && (
        <BookingForm
          key={args.booking._id}
          reschedule={args.booking}
          onFinished={() => setArgs(null)}
          onCancel={() => setArgs(null)}
        />
      )}
    </Modal>
  );
});
