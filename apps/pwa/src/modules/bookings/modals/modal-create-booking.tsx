"use client";

import { ModalHead } from "@/components/modal/modal-head";
import { Trans } from "@lingui/react/macro";
import { Modal } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { BookingForm, BookingFormProps } from "../components/form-booking";

export interface ModalCreateBookingRef {
  open: (args?: Omit<BookingFormProps, "onFinished">) => void;
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
      {typeof children === "function"
        ? children({
            open: (p) => {
              setArgs(p ?? {});
            },
            close: () => {
              setArgs(null);
            },
          })
        : null}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        title={
          <ModalHead
            name={
              args?.reschedule ? <Trans>Reschedule booking</Trans> : <Trans>Create booking</Trans>
            }
            icon={IconCalendar}
          />
        }
        size={500}
      >
        {args && (
          <BookingForm {...args} onFinished={() => setArgs(null)} onCancel={() => setArgs(null)} />
        )}
      </Modal>
    </Fragment>
  );
});
