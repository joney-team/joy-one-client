"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { PrescriptionSelector } from "@/components/selector/prescription-selector";
import { ProductSelector } from "@/components/selector/product-selector";
import { getView } from "@/layout/layout-service";
import { CustomerInput } from "@/modules/customers/customer-input";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { t } from "@/modules/lang/lang-service";
import {
  createPrescription,
  removePrescription,
  updatePrescription,
} from "@/modules/prescriptions/prescriptions-service";
import {
  PrescriptionDto,
  PrescriptionEntity,
  PrescriptionItem,
} from "@/modules/prescriptions/prescriptions-types";
import { ProductType } from "@/modules/products/products-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { onArchive } from "@/utils/actions";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { onError } from "@/utils/exceptions.utils";
import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Group,
  InputWrapper,
  NumberInput,
  Stack,
  Text,
  Textarea,
  em,
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
import { PrintButton } from "@/modals/modal-printer";

interface ModalPrescriptionFormProps {
  prescription?: PrescriptionEntity;
  customer?: CustomerShortInfo;
  notUseTemplate?: boolean;
}

const itemNotes = ["take_after_eating", "take_before_eating"];

export const ModalPrescriptionForm: FC<ModalPrescriptionFormProps> = (props) => {
  const workspace = useWorkspace();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState(props.customer);

  const defaultItem: PrescriptionItem = {
    name: "",
    unit: t("pill"),
    days: 1,
    qty: { morning: 0, afternoon: 0, noon: 0 },
    note: t(itemNotes[0]),
  };

  const [items, handler] = useListState<PrescriptionItem>(
    props.prescription?.items || [defaultItem]
  );

  const form = useForm<PrescriptionDto>({
    initialValues: {
      name: props.prescription?.name || "",
      note: props.prescription?.note || "",
      items: [],
    },
    validate: {
      name: (value) => {
        if (!value) return t("required");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      if (props.prescription) {
        await updatePrescription(props.prescription._id, { ...values, items });
      } else {
        await createPrescription({ ...values, items });
      }
      modals.close("ModalPrescriptionForm");
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack pb={10}>
      <TextInput
        label={t("prescription_name")}
        withAsterisk
        placeholder={t("prescription_name_placeholder")}
        {...form.getInputProps("name")}
      />

      <InputWrapper label={t("list")} withAsterisk>
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
                        props={{ flex: 1 }}
                        type={[ProductType.PRODUCT]}
                        onSelect={(product) =>
                          handler.setItem(index, {
                            ...item,
                            name: product.name,
                            unit: product.unit,
                          })
                        }
                        renderTrigger={(ctx) => {
                          return (
                            <TextInput
                              value={item.name}
                              onChange={() => false}
                              flex={1}
                              onClick={ctx.toggle}
                              placeholder={t("pill_name")}
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
                        label={t("unit")}
                        maw={100}
                        value={item.unit}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, unit: e.currentTarget.value })
                        }
                      />

                      <NumberInput
                        label={t("days_num")}
                        value={item.days}
                        onChange={(e) => handler.setItem(index, { ...item, days: +e })}
                        maw={100}
                      />

                      <NumberInput
                        label={t("morning")}
                        value={item.qty.morning}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, qty: { ...item.qty, morning: +e } })
                        }
                        maw={100}
                      />

                      <NumberInput
                        label={t("noon")}
                        value={item.qty.noon}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, qty: { ...item.qty, noon: +e } })
                        }
                        maw={100}
                      />

                      <NumberInput
                        label={t("afternoon")}
                        value={item.qty.afternoon}
                        onChange={(e) =>
                          handler.setItem(index, { ...item, qty: { ...item.qty, afternoon: +e } })
                        }
                        maw={100}
                      />
                    </Group>

                    <TextInput
                      label={t("usage")}
                      value={item.note}
                      onChange={(e) =>
                        handler.setItem(index, { ...item, note: e.currentTarget.value })
                      }
                      flex={1}
                      placeholder={t("usage_placeholder")}
                    />

                    <Group gap={5}>
                      {itemNotes.map((note, i) => {
                        const value = t(note);
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
              {t("add_pill")}
            </Button>
          </Center>
        </Stack>
      </InputWrapper>

      <Textarea
        label={t("advice")}
        {...form.getInputProps("note")}
        placeholder={t("advice_placeholder")}
      />

      <Group mt={10} justify="center" gap={10}>
        <CustomerInput
          disabled={!!props.customer}
          styles={{ description: { marginBottom: 5 } }}
          value={customer}
          onSelect={(customer) => setCustomer(customer)}
        />

        <PrintButton
          customer={customer}
          prescription={{
            ...form.values,
            items,
            _id: props.prescription?._id || "",
            createdAt: DateTimeUtils.timeToSeconds(),
            workspaceId: workspace.userMember.workspaceId,
          }}
        />

        <Renderer visible={!props.prescription && !props.notUseTemplate}>
          <PrescriptionSelector
            onSelect={(prescription) => {
              form.setValues(prescription);
              handler.setState(prescription.items || [defaultItem]);
            }}
            renderTrigger={(ctx) => {
              return (
                <Button
                  onClick={ctx.toggle}
                  type="submit"
                  maw="100%"
                  variant="outline"
                  radius={200}
                >
                  {t("select_prescription_template")}
                </Button>
              );
            }}
          />
        </Renderer>

        {workspace.hasPermission(WorkspacePermission.PRESCRIPTIONS_WRITE) && !props.customer && (
          <Button
            loading={isSubmitting}
            onClick={onSubmit}
            rightSection={<IconArrowDown strokeWidth={1.2} />}
            type="submit"
            maw="100%"
            radius={200}
          >
            {t("save_prescription_template")}
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
                name: t("prescription"),
                process: () => removePrescription(props.prescription!._id),
                onArchived: () => modals.close("ModalPrescriptionForm"),
              })
            }
          >
            <Text fz={12} fw={400}>
              {t("delete")}
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
    title: <ModalTitle title={t("prescription")} icon={IconPill} />,
    children: <ModalPrescriptionForm {...props} />,
    size: "xl",
    fullScreen: getView() === "mobile",
  });
};
