"use client";

import { CustomerRelationshipContact } from "@/modules/customers/customer-types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  em,
  Group,
  InputWrapper,
  InputWrapperProps,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "../../../components/buttons/button";
import { Renderer } from "../../../components/renderer";

interface CustomerRelationshipContactInputProps
  extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: CustomerRelationshipContact[];
  onChange?: (value: CustomerRelationshipContact[]) => void;
  disabled?: boolean;
}

export const CustomerRelationshipContactInput: FC<CustomerRelationshipContactInputProps> = (
  props
) => {
  const contacts = props.value || [];

  let _props = { ...props } as any;

  delete _props.value;
  delete _props.onChange;

  const onAdd = () => {
    props.onChange?.([
      ...contacts,
      {
        name: "",
        phone: "",
        type: "",
      },
    ]);
  };

  return (
    <InputWrapper {..._props} label={props.label || t`Contact relatives`}>
      <Card p={8} withBorder shadow="none">
        <Stack justify="stretch">
          {contacts.map((contact, i) => {
            const onChange = (key: keyof CustomerRelationshipContact, value: any) => {
              if (props.disabled) return;
              const newContacts = [...contacts];
              newContacts[i][key] = value;
              props.onChange?.(newContacts);
            };

            const onRemove = () => {
              if (props.disabled) return;
              const newContacts = [...contacts];
              newContacts.splice(i, 1);
              props.onChange?.(newContacts);
            };

            return (
              <Group key={i} w="100%" align="start">
                <Text fz={em(12)}>{i + 1}.</Text>
                <SimpleGrid cols={{ md: 3 }} flex={1}>
                  <TextInput
                    flex={1}
                    placeholder={t`Name`}
                    value={contact.name}
                    onChange={(e) => onChange("name", e.target.value)}
                  />

                  <TextInput
                    flex={1}
                    placeholder={t`Phone`}
                    value={contact.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                  />

                  <TextInput
                    flex={1}
                    placeholder={t`Relationship type`}
                    value={contact.type}
                    onChange={(e) => onChange("type", e.target.value)}
                  />
                </SimpleGrid>

                <ActionIcon variant="subtle" color="gray.5" onClick={onRemove}>
                  <IconMinus size={18} />
                </ActionIcon>
              </Group>
            );
          })}

          <Renderer visible={!props.disabled}>
            <Group>
              <Button
                size="compact-xs"
                variant="light"
                fz={em(13)}
                leftIcon={IconPlus}
                radius={200}
                onClick={onAdd}
              >
                <Trans>Add contact</Trans>
              </Button>
            </Group>
          </Renderer>
        </Stack>
      </Card>
    </InputWrapper>
  );
};
