"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { Renderer } from "@/components/renderer";
import { CustomerRelationshipContactInput } from "@/modules/customers/components/customer-relationship-contact-input";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useMutation } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Center, Stack } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconAddressBook, IconCheck } from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";
import { normalizeCustomerInput } from "../customer-service";
import { CustomerDataFragment } from "../graphql/fragmentCustomer.graphql";
import UPDATE_CUSTOMER from "../graphql/mutationUpdateCustomer.graphql";

interface ModalCustomerRelationshipContactsProps {
  customer: CustomerDataFragment;
}

export const ModalCustomerRelationshipContacts: FC<ModalCustomerRelationshipContactsProps> = (
  props
) => {
  const customerInput = normalizeCustomerInput(props.customer);
  const [contacts, handlers] = useListState(customerInput.relationshipContacts || []);
  const workspace = useWorkspace();
  const isEditable = workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO);

  const [updateCustomer] = useMutation(UPDATE_CUSTOMER);

  const isUpdateAble = useRef(false);
  useEffect(() => {
    setTimeout(() => (isUpdateAble.current = true), 200);
  }, []);

  const onSave = async () => {
    await updateCustomer({
      variables: {
        id: props.customer._id,
        input: {
          ...customerInput,
          relationshipContacts: contacts,
        },
      },
    });
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
