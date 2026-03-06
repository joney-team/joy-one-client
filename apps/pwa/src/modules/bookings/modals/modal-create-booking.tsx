"use client";

import { Modal } from "@/components/modal/modal";
import { Trans } from "@lingui/react/macro";
import { IconCalendar } from "@tabler/icons-react";
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { BookingForm, BookingFormProps } from "../components/form-booking";

export interface ModalCreateBookingRef {
  open: (
    args?: Pick<BookingFormProps, "customer" | "endTime" | "startTime" | "assigneeUsers">
  ) => void;
  close: () => void;
}

export const ModalCreateBooking = forwardRef<
  ModalCreateBookingRef,
  {
    children?: (ref: ModalCreateBookingRef) => ReactNode;
  }
>((props, ref) => {
  const { children } = props;
  const [args, setArgs] = useState<Omit<BookingFormProps, "onFinished"> | null>(null);

  useImperativeHandle(ref, () => ({
    open: (p) => {
      setArgs(p ?? {});
    },
    close: () => {
      setArgs(null);
    },
  }));

  return (
    <Fragment>
      {children?.({
        open: (p) => {
          setArgs(p ?? {});
        },
        close: () => {
          setArgs(null);
        },
      })}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        icon={IconCalendar}
        name={args?.reschedule ? <Trans>Reschedule booking</Trans> : <Trans>Create booking</Trans>}
        size={500}
      >
        {args && (
          <BookingForm {...args} onFinished={() => setArgs(null)} onCancel={() => setArgs(null)} />
        )}
      </Modal>
    </Fragment>
  );
});
