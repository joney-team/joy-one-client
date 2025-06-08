import { TextInput } from "@/components/inputs/text-input";
import { CustomerRelationshipContact } from "@/modules/customers/customer-types";
import { t } from "@/modules/lang/lang-service";
import { ActionIcon, Card, em, Group, InputWrapper, InputWrapperProps, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "../../components/buttons/button";
import { Renderer } from "../../components/renderer";

interface CustomerRelationshipContactInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: CustomerRelationshipContact[];
  onChange?: (value: CustomerRelationshipContact[]) => void;
  disabled?: boolean;
}

export const CustomerRelationshipContactInput: FC<CustomerRelationshipContactInputProps> = (props) => {
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
    <InputWrapper {..._props} label={props.label || t("customer_relationship_contacts")}>
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
                    placeholder={t("name")}
                    value={contact.name}
                    onChange={(e) => onChange("name", e.target.value)}
                  />

                  <TextInput
                    flex={1}
                    placeholder={t("phone")}
                    value={contact.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                  />

                  <TextInput
                    flex={1}
                    placeholder={t("relationship_type")}
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
                iconSize={16}
                radius={200}
                onClick={onAdd}
              >
                {t("add_contact")}
              </Button>
            </Group>
          </Renderer>
        </Stack>
      </Card>
    </InputWrapper>
  );
};
