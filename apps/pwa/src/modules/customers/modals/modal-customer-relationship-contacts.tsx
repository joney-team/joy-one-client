import { Button } from "@/components/buttons/button";
import { CustomerRelationshipContactInput } from "@/modules/customers/customer-relationship-contact-input";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { updateCustomer } from "../customer-service";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { t } from "@/modules/lang/lang-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Center, Stack } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconAddressBook, IconCheck } from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";

interface ModalCustomerRelationshipContactsProps {
  customer: CustomerEntity;
}

export const ModalCustomerRelationshipContacts: FC<ModalCustomerRelationshipContactsProps> = (props) => {
  const [contacts, handlers] = useListState(props.customer.relationshipContacts || []);
  const workspace = useWorkspace();
  const isEditable = workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO);

  const isUpdateAble = useRef(false);
  useEffect(() => {
    setTimeout(() => (isUpdateAble.current = true), 200);
  }, []);

  const onSave = async () => {
    await updateCustomer(props.customer._id, { ...props.customer, relationshipContacts: contacts });
    modals.close("ModalCustomerRelationshipContacts");
  };

  return (
    <Stack>
      <CustomerRelationshipContactInput value={contacts} onChange={handlers.setState} disabled={!isEditable} />

      <Renderer visible={isEditable}>
        <Center>
          <Button onClick={onSave} leftIcon={IconCheck} type="submit">
            {t("save")}
          </Button>
        </Center>
      </Renderer>
    </Stack>
  );
};

export const OnModalCustomerRelationshipContacts = (props: ModalCustomerRelationshipContactsProps) => {
  return modals.open({
    modalId: "ModalCustomerRelationshipContacts",
    title: <ModalTitle title={t("customer_relationship_contacts")} icon={IconAddressBook} />,
    children: <ModalCustomerRelationshipContacts {...props} />,
    size: 800,
  });
};
