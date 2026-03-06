"use client";

import { IconUser, IconUserPlus } from "@tabler/icons-react";

import { Modal } from "@/components/modal/modal";
import { CustomerForm, CustomerFormProps } from "@/modules/customers/components/customer-form";
import { Trans } from "@lingui/react/macro";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";

export interface ModalCustomerRef {
  open: (args?: CustomerFormProps) => void;
  close: () => void;
}

export const ModalCustomer = forwardRef<
  ModalCustomerRef,
  {
    children?: (ref: ModalCustomerRef) => ReactNode;
  }
>((props, ref) => {
  const { children } = props;
  const [args, setArgs] = useState<CustomerFormProps | null>(null);

  useImperativeHandle(ref, () => ({
    open: (p) => {
      setArgs(p ?? {});
    },
    close: () => {
      setArgs(null);
    },
  }));

  const modalId = useMemo(() => {
    return `customer-modal-${args?.customer?._id ?? "new"}`;
  }, [args?.customer?._id]);

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
        id={modalId}
        key={modalId}
        opened={!!args}
        onClose={() => setArgs(null)}
        name={args?.customer ? <Trans>Update customer</Trans> : <Trans>Create customer</Trans>}
        icon={args?.customer ? IconUser : IconUserPlus}
        size="lg"
        isFullscreenOnMobile
      >
        {args && <CustomerForm {...args} onClose={() => setArgs(null)} />}
      </Modal>
    </Fragment>
  );
});
