import { ModalTitle } from "@/components/modal-title";
import { CustomerForm } from "@/modules/customers/components/form-customer";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { t } from "@lingui/core/macro";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUser } from "@tabler/icons-react";
import { FC, useRef } from "react";

export interface ModalCustomerRelationshipFormProps {
  onDone?: (customer: CustomerEntity) => void | Promise<void>;
}

export let OnModalCustomerRelationshipForm: (props: ModalCustomerRelationshipFormProps) => void;

export const ModalCustomerRelationShipForm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const props = useRef<ModalCustomerRelationshipFormProps>({});

  OnModalCustomerRelationshipForm = (p) => {
    props.current = p;
    open();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<ModalTitle icon={IconUser} title={t`Add customer relationship`} />}
      size={800}
      yOffset={16}
      zIndex={300}
    >
      <CustomerForm onDone={props.current.onDone} onClose={close} relationship />
    </Modal>
  );
};
