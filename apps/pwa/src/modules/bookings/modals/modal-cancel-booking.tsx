"use client";

import { Button } from "@/components/buttons/button";
import { onError } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Center, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCalendarMinus } from "@tabler/icons-react";
import { FC, forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react";
import { BookingFragment } from "../graphql/fragmentBooking.graphql";

import { Modal } from "@/components/modal/modal";
import { useMutation } from "@apollo/client/react";
import MUTATION_CANCEL_BOOKING from "../graphql/mutationCancelBooking.graphql";

interface ModalCancelBookingProps {
  booking: Pick<BookingFragment, "_id">;
  onCancelled?: () => void;
  onClose: () => void;
}

const CancelBookingForm: FC<ModalCancelBookingProps> = (props) => {
  const { t } = useLingui();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelBooking] = useMutation(MUTATION_CANCEL_BOOKING);

  const form = useForm({
    validate: {
      reason: (value) => {
        if (!value) return t`Please enter the reason for cancellation`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await cancelBooking({
        variables: {
          id: props.booking._id,
          reason: values.reason,
        },
      });
      props.onCancelled?.();
      props.onClose();
    } catch (error) {
      onError(error);
    }
    setIsSubmitting(false);
  });

  return (
    <Stack>
      <Textarea withAsterisk label={t`Reason for cancellation`} {...form.getInputProps("reason")} />

      <Center>
        <Button loading={isSubmitting} onClick={() => onSubmit()} color="red" type="submit">
          <Trans>Confirm cancellation</Trans>
        </Button>
      </Center>
    </Stack>
  );
};

type ModalCancelBookingState = Pick<ModalCancelBookingProps, "booking" | "onCancelled">;

export interface ModalCancelBookingRef {
  open: (state: ModalCancelBookingState) => void;
  close: () => void;
}

export const ModalCancelBooking = forwardRef<
  ModalCancelBookingRef,
  { children?: (ref: ModalCancelBookingRef) => ReactNode }
>((props, ref) => {
  const [state, setState] = useState<ModalCancelBookingState | null>(null);

  const onClose = () => {
    setState(null);
  };

  useImperativeHandle(ref, () => ({
    open: (b) => setState(b),
    close: onClose,
  }));

  return (
    <Fragment>
      {props.children?.({
        open: (b) => setState(b),
        close: onClose,
      })}

      <Modal
        opened={!!state}
        onClose={onClose}
        name={<Trans>Cancel booking</Trans>}
        icon={IconCalendarMinus}
        color="red"
      >
        {!!state && (
          <CancelBookingForm
            booking={state.booking}
            onCancelled={state.onCancelled}
            onClose={onClose}
          />
        )}
      </Modal>
    </Fragment>
  );
});
