"use client";

import { ModalTitle } from "@/components/modal-title";
import { IconUser, IconUserPlus } from "@tabler/icons-react";

import { useLayout } from "@/layout/layout-context";
import { CustomerForm, CustomerFormProps } from "@/modules/customers/components/form-customer";
import { Trans } from "@lingui/react/macro";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, Fragment, ReactNode, useState } from "react";

export const ModalCustomer: FC<{
  children: (open: (props?: CustomerFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const layout = useLayout();
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<CustomerFormProps>();

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
              props?.customer ? <Trans>Update customer</Trans> : <Trans>Create customer</Trans>
            }
            icon={props?.customer ? IconUser : IconUserPlus}
          />
        }
        size="lg"
        fullScreen={layout.view === "mobile"}
      >
        <CustomerForm {...props} onClose={() => close()} />
      </Modal>
    </Fragment>
  );
};
