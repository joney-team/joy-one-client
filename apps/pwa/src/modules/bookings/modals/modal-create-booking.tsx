"use client";

import { ModalTitle } from "@/components/modal-title";
import { Trans } from "@lingui/react/macro";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar } from "@tabler/icons-react";
import { FC, ReactNode, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { BookingForm, BookingFormProps } from "../components/form-booking";

export const ModalCreateBooking: FC<{
  children: (open: (props?: Omit<BookingFormProps, "onFinished">) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<Omit<BookingFormProps, "onFinished">>();

  return (
    <Fragment>
      {children((p) => {
        setProps(p);
        open();
      })}

      <Modal
        opened={opened}
        onClose={close}
        title={
          <ModalTitle
            title={
              props?.reschedule ? <Trans>Reschedule booking</Trans> : <Trans>Create booking</Trans>
            }
            icon={IconCalendar}
          />
        }
        size={500}
      >
        {opened && <BookingForm {...props} onFinished={() => close()} onCancel={() => close()} />}
      </Modal>
    </Fragment>
  );
};
