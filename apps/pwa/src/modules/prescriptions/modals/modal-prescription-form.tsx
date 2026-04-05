"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { Renderer } from "@/components/renderer";
import { ProductType } from "@/graphql/enums.graphql";
import { PrescriptionInput, PrescriptionItemInput } from "@/graphql/types.graphql";
import { getView } from "@/layout/layout-service";
import { PrintButton } from "@/modals/modal-printer";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { PrescriptionSelector } from "@/modules/prescriptions/components/prescription-selector";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  em,
  Group,
  InputWrapper,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconArchive,
  IconArrowDown,
  IconMinus,
  IconPill,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { FC, useState } from "react";
import CreatePrescriptionDocument from "../graphql/createPrescription.graphql";
import DeletePrescriptionDocument from "../graphql/deletePrescription.graphql";
import { PrescriptionFragment } from "../graphql/fragmentPrescription.graphql";
import UpdatePrescriptionDocument from "../graphql/updatePrescription.graphql";

interface ModalPrescriptionFormProps {
  prescription?: PrescriptionFragment;
  customer?: any;
  notUseTemplate?: boolean;
}

export const ModalPrescriptionForm: FC<ModalPrescriptionFormProps & { onClose: () => void }> = (
  props,
) => {
  const workspace = useWorkspace();
  const client = useApolloClient();
  const { t } = useLingui();
  const itemNotes = [t`Take after eating`, t`Take before eating`];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState(props.customer);

  const defaultItem: PrescriptionItemInput = {
    name: "",
    unit: t`Pill`,
    days: 1,
    qty: { morning: 0, afternoon: 0, noon: 0 },
    note: itemNotes[0],
  };

  const [items, handler] = useListState<PrescriptionItemInput>(
    props.prescription?.items || [defaultItem],
  );

  const form = useForm<PrescriptionInput>({
    initialValues: {
      name: props.prescription?.name || "",
      note: props.prescription?.note || "",
      items: [],
    },
    validate: {
      name: (value) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      if (props.prescription) {
        await client.mutate({
          mutation: UpdatePrescriptionDocument,
          variables: {
            input: { ...values, items },
            prescriptionId: props.prescription._id,
          },
        });
      } else {
        await client.mutate({
          mutation: CreatePrescriptionDocument,
          variables: { input: { ...values, items } },
        });
      }
      props.onClose();
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack pb={10}>
      <TextInput
        label={<Trans>Prescription name</Trans>}
        withAsterisk
        placeholder={t`Ex: Prescription 1, Treatment of leukemia...`}
        {...form.getInputProps("name")}
      />

      <InputWrapper label={<Trans>List</Trans>} withAsterisk>
        <Stack>
          {items.map((item, index) => {
            return (
              <Card key={index} p={8} withBorder>
                <Group align="start" gap={0}>
                  <Stack gap={8} flex={1}>
                    <Group gap={8}>
                      <Text c="primary" fz={em(13)} fw={700}>
                        {index + 1}.
                      </Text>

                      <ProductSelector
                        flex={1}
                        type={[ProductType.Product]}
                        onSelect={(product) =>
                          handler.setItem(index, {
                            ...item,
                            name: product.name,
                            unit: product.unit,
                          })
                        }
                        target={(ctx) => {
                          return (
                            <TextInput
                              value={item.name}
                              onChange={() => false}
                              flex={1}
                              onClick={ctx.toggle}
                              placeholder={t`Enter pill name`}
                              rightSection={
                                <ActionIcon variant="transparent" color="gray" onClick={ctx.toggle}>
                                  <IconSearch size={18} />
                                </ActionIcon>
                              }
                            />
                          );
                        }}
                      />

                      {index > 0 && (
                        <ActionIcon
                          color="gray.4"
                          size="xs"
                          h={36}
                          variant="light"
                          w={36}
                          onClick={() => handler.remove(index)}
                        >
                          <IconMinus />
                        </ActionIcon>
                      )}
                    </Group>

                    <Group gap={8} wrap="nowrap">
                      <TextInput
                        label={<Trans>Unit</Trans>}
                        maw={100}
                        value={item.unit}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, unit: e.currentTarget.value })
                        }
                      />

                      <NumberInput
                        label={<Trans>Days number</Trans>}
                        value={item.days}
                        onChange={(e) => handler.setItem(index, { ...item, days: +e })}
                        maw={100}
                      />

                      <NumberInput
                        label={<Trans>Morning</Trans>}
                        value={item.qty.morning ?? undefined}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, qty: { ...item.qty, morning: +e } })
                        }
                        maw={100}
                      />

                      <NumberInput
                        label={<Trans>Noon</Trans>}
                        value={item.qty.noon ?? undefined}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, qty: { ...item.qty, noon: +e } })
                        }
                        maw={100}
                      />

                      <NumberInput
                        label={<Trans>Afternoon</Trans>}
                        value={item.qty.afternoon ?? undefined}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, qty: { ...item.qty, afternoon: +e } })
                        }
                        maw={100}
                      />
                    </Group>

                    <TextInput
                      label={<Trans>Usage</Trans>}
                      value={item.note ?? undefined}
                      onChange={(e) =>
                        handler.setItem(index, { ...item, note: e.currentTarget.value })
                      }
                      flex={1}
                      placeholder={t`Ex: Take after eating, take before eating...`}
                    />

                    <Group gap={5}>
                      {itemNotes.map((note, i) => {
                        const value = note;
                        return (
                          <Badge
                            key={i}
                            color="gray"
                            variant="outline"
                            tt="none"
                            fw={500}
                            onClick={() => handler.setItem(index, { ...item, note: value })}
                            style={{ cursor: "pointer", borderWidth: 0.5 }}
                          >
                            {value}
                          </Badge>
                        );
                      })}
                    </Group>
                  </Stack>
                </Group>
              </Card>
            );
          })}

          <Center>
            <Button
              variant="outline"
              leftSection={<IconPlus strokeWidth={1.2} size={18} />}
              radius={150}
              h={32}
              onClick={() => handler.append(defaultItem)}
              styles={{
                label: {
                  fontSize: 14,
                  fontWeight: 400,
                },
              }}
            >
              {<Trans>Add pill</Trans>}
            </Button>
          </Center>
        </Stack>
      </InputWrapper>

      <Textarea
        label={<Trans>Advice</Trans>}
        {...form.getInputProps("note")}
        placeholder={t`Ex: Take after eating, take before eating...`}
      />

      <Group mt={10} justify="center" gap={10}>
        <CustomerInput
          disabled={!!props.customer}
          styles={{ description: { marginBottom: 5 } }}
          value={customer}
          onSelect={(customer) => setCustomer(customer as any)}
        />

        <PrintButton
          customer={customer}
          prescription={{
            name: form.values.name,
            note: form.values.note ?? "",
            items,
          }}
        />

        <Renderer visible={!props.prescription && !props.notUseTemplate}>
          <PrescriptionSelector
            onSelect={(prescription) => {
              form.setValues(prescription);
              handler.setState(prescription.items || [defaultItem]);
            }}
            target={(ctx) => {
              return (
                <Button
                  onClick={ctx.toggle}
                  type="submit"
                  maw="100%"
                  variant="outline"
                  radius={200}
                >
                  {<Trans>Select prescription template</Trans>}
                </Button>
              );
            }}
          />
        </Renderer>

        {workspace.hasPermission(WorkspacePermission.PRESCRIPTIONS_WRITE) && !props.customer && (
          <Button
            loading={isSubmitting}
            onClick={() => onSubmit()}
            rightSection={<IconArrowDown strokeWidth={1.2} />}
            type="submit"
            maw="100%"
            radius={200}
          >
            <Trans>Save prescription template</Trans>
          </Button>
        )}
      </Group>

      {workspace.hasPermission(WorkspacePermission.PRESCRIPTIONS_WRITE) && !!props.prescription && (
        <Center mt={20}>
          <Button
            h={25}
            variant="subtle"
            color="gray"
            leftSection={<IconArchive strokeWidth={1.3} size={16} style={{ marginRight: -5 }} />}
            onClick={() =>
              onArchive({
                name: <Trans>Prescription</Trans>,
                process: async () => {
                  await client.mutate({
                    mutation: DeletePrescriptionDocument,
                    variables: { prescriptionId: props.prescription!._id },
                  });
                  props.onClose();
                },
              })
            }
          >
            <Text fz={12} fw={400}>
              <Trans>Delete</Trans>
            </Text>
          </Button>
        </Center>
      )}
    </Stack>
  );
};

export const OnModalPrescriptionForm = (props: ModalPrescriptionFormProps) => {
  return modals.open({
    modalId: "ModalPrescriptionForm",
    title: <ModalHead name={<Trans>Prescription</Trans>} icon={IconPill} />,
    children: (
      <ModalPrescriptionForm {...props} onClose={() => modals.close("ModalPrescriptionForm")} />
    ),
    size: "xl",
    fullScreen: getView() === "mobile",
    zIndex: zIndexes.commonModals,
  });
};
