"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { Renderer } from "@/components/renderer";
import { CustomerRelationshipContactInput } from "@/modules/customers/components/customer-relationship-contact-input";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Center, Stack } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconAddressBook, IconCheck } from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";
import { updateCustomer } from "../customer-service";

interface ModalCustomerRelationshipContactsProps {
  customer: CustomerEntity;
}

export const ModalCustomerRelationshipContacts: FC<ModalCustomerRelationshipContactsProps> = (
  props
) => {
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
      <CustomerRelationshipContactInput
        value={contacts}
        onChange={handlers.setState}
        disabled={!isEditable}
      />

      <Renderer visible={isEditable}>
        <Center>
          <Button onClick={onSave} leftIcon={IconCheck} type="submit">
            <Trans>Save</Trans>
          </Button>
        </Center>
      </Renderer>
    </Stack>
  );
};

export const OnModalCustomerRelationshipContacts = (
  props: ModalCustomerRelationshipContactsProps
) => {
  return modals.open({
    modalId: "ModalCustomerRelationshipContacts",
    title: <ModalHead name={t`Contact relatives`} icon={IconAddressBook} />,
    children: <ModalCustomerRelationshipContacts {...props} />,
    size: 800,
  });
};
