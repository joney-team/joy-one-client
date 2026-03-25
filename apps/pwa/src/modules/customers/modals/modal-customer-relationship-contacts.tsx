"use client";

import { Button } from "@/components/buttons/button";
import { Modal } from "@/components/modal/modal";
import { Renderer } from "@/components/renderer";
import { CustomerRelationshipContactInput } from "@/modules/customers/customer-detail/customer-relationship-contact-input";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useMutation } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Center, Stack } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconAddressBook, IconCheck } from "@tabler/icons-react";
import {
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { normalizeCustomerInput } from "../customer-constants";
import { CustomerFragment } from "../graphql/fragmentCustomer.graphql";
import UPDATE_CUSTOMER from "../graphql/mutationUpdateCustomer.graphql";

interface ModalCustomerRelationshipContactsArgs {
  customer: CustomerFragment;
  onClose: () => void;
}

export const ModalCustomerRelationshipContactsContent: FC<ModalCustomerRelationshipContactsArgs> = (
  props,
) => {
  const { customer, onClose } = props;
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
        id: customer._id,
        input: {
          ...customerInput,
          relationshipContacts: contacts,
        },
      },
    });
    onClose();
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

export interface ModalCustomerRelationshipContactsRef {
  open: (props: Pick<ModalCustomerRelationshipContactsArgs, "customer">) => void;
  close: () => void;
}

export const ModalCustomerRelationshipContacts = forwardRef<
  ModalCustomerRelationshipContactsRef,
  { children?: (ref: ModalCustomerRelationshipContactsRef) => ReactNode }
>((props, ref) => {
  const { children } = props;
  const [args, setArgs] = useState<Pick<ModalCustomerRelationshipContactsArgs, "customer"> | null>(
    null,
  );

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
      {children?.({
        open: (p) => {
          setArgs(p);
        },
        close: () => {
          setArgs(null);
        },
      })}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        name={<Trans>Contact relatives</Trans>}
        icon={IconAddressBook}
        size={800}
      >
        {args && (
          <ModalCustomerRelationshipContactsContent {...args} onClose={() => setArgs(null)} />
        )}
      </Modal>
    </Fragment>
  );
});
