import { CustomerForm } from "@/modules/customers/components/form-customer";
import { ModalTitle } from "@/components/modal-title";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { tl } from "@/modules/lang/lang-service";
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
      title={<ModalTitle icon={IconUser} title={`${tl("add")} ${tl("customer_relationship")}`} />}
      size={800}
      yOffset={16}
      zIndex={300}
    >
      <CustomerForm onDone={props.current.onDone} onClose={close} relationship />
    </Modal>
  );
};
