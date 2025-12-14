"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { Renderer } from "@/components/renderer";
import { setCustomerContacts } from "@/modules/customer-contacts/customer-contacts.service";
import { CustomerContactEntity } from "@/modules/customer-contacts/customer-contacts.types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  em,
  Group,
  InputWrapper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconAddressBook,
  IconCheck,
  IconMinus,
  IconPhoneCall,
  IconPlus,
} from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";

interface ModalCustomerContactsProps {
  contacts: CustomerContactEntity;
}

export const ModalCustomerContacts: FC<ModalCustomerContactsProps> = (props) => {
  const [contacts, handlers] = useListState(props.contacts.contacts);
  const workspace = useWorkspace();
  const isEditable = workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO);

  const isUpdateAble = useRef(false);
  useEffect(() => {
    setTimeout(() => (isUpdateAble.current = true), 200);
  }, []);

  const onSave = () => {
    const availabelContacts = contacts.filter((c) => c.name.trim() !== "" && c.phones.length > 0);
    setCustomerContacts(props.contacts.customerId, { contacts: availabelContacts }).catch(onError);
  };

  return (
    <Stack>
      {contacts.map((c, index) => {
        const onChangeName = (val: string) => {
          handlers.setItem(index, { ...contacts[index], name: val });
        };

        const phones = c.phones.length === 0 ? [""] : c.phones;

        return (
          <Card key={index} withBorder shadow="none" p={10}>
            <Group align="start" wrap="nowrap" gap={10}>
              <Text fz={em(12)}>{index + 1}.</Text>
              <Stack gap={10} flex={1} mt={-5}>
                <TextInput
                  label={t`Name`}
                  value={c.name}
                  onChange={(e) => {
                    if (!isEditable) return;
                    onChangeName(e.target.value);
                  }}
                />

                <InputWrapper label={t`Phones`}>
                  <Stack gap={10}>
                    {phones.map((p, i) => {
                      return (
                        <Group wrap="nowrap" gap={5} key={i}>
                          <TextInput
                            flex={1}
                            key={i}
                            value={p}
                            onChange={(e) => {
                              if (!isEditable) return;
                              const newPhones = c.phones.slice();
                              newPhones[i] = e.target.value;
                              handlers.setItem(index, { ...contacts[index], phones: newPhones });
                            }}
                          />

                          <Anchor href={`tel:${p}`}>
                            <ActionIcon color="gray" variant="light" size={36}>
                              <IconPhoneCall strokeWidth={1.2} height={18} />
                            </ActionIcon>
                          </Anchor>

                          <Renderer visible={isEditable}>
                            <ActionIcon
                              size={36}
                              color="gray"
                              variant="subtle"
                              onClick={() => {
                                const newPhones = c.phones.slice();
                                newPhones.splice(i, 1);
                                handlers.setItem(index, { ...contacts[index], phones: newPhones });
                              }}
                            >
                              <IconMinus strokeWidth={1.2} height={13} />
                            </ActionIcon>
                          </Renderer>
                        </Group>
                      );
                    })}

                    <Renderer visible={isEditable}>
                      <ActionIcon
                        variant="light"
                        color="gray"
                        size={36}
                        onClick={() => {
                          const newPhones = c.phones.slice();
                          newPhones.push("");
                          handlers.setItem(index, { ...contacts[index], phones: newPhones });
                        }}
                      >
                        <IconPlus strokeWidth={1.2} height={16} />
                      </ActionIcon>
                    </Renderer>
                  </Stack>
                </InputWrapper>
              </Stack>

              <Renderer visible={isEditable}>
                <ActionIcon
                  size={36}
                  color="gray"
                  variant="subtle"
                  onClick={() => handlers.remove(index)}
                >
                  <IconMinus strokeWidth={1.2} height={13} />
                </ActionIcon>
              </Renderer>
            </Group>
          </Card>
        );
      })}

      <Renderer visible={isEditable}>
        <Group>
          <Button
            variant="light"
            size="compact-sm"
            leftIcon={IconPlus}
            radius={200}
            fz={em(14)}
            onClick={() => {
              handlers.append({ name: "", phones: [] });
            }}
          >
            <Trans>Add contact</Trans>
          </Button>
        </Group>

        <Button onClick={onSave} leftIcon={IconCheck}>
          <Trans>Save</Trans>
        </Button>
      </Renderer>
    </Stack>
  );
};

export const OnModalCustomerContacts = (props: ModalCustomerContactsProps) => {
  return modals.open({
    modalId: "ModalCustomerContacts",
    title: <ModalHead name={t`Contacts`} icon={IconAddressBook} />,
    children: <ModalCustomerContacts {...props} />,
  });
};
