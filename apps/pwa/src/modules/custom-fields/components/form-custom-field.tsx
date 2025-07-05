"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { onError, onFormError } from "@/utils/exceptions.utils";
import {
  Center,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, type FC } from "react";
import { CustomFieldEntity, CustomFieldType } from "../custom-field-types";
import { AppEntity } from "@/types";

export interface FormCustomFieldProps {
  customField?: CustomFieldEntity;
  type?: CustomFieldType;
  onSuccess?: (customField: CustomFieldEntity) => void;
  onArchive?: () => void;
}

const supportedTypes = [CustomFieldType.TEXT, CustomFieldType.NUMBER, CustomFieldType.SWITCH];

export const FormCustomField: FC<FormCustomFieldProps> = (props) => {
  const { customField, onSuccess } = props;

  const form = useForm<{
    label: string;
    description?: string;
    placeholder?: string;
    type: CustomFieldType;
    entities: AppEntity[];
    config?: any;
    key?: string;
    order: number;
  }>({
    initialValues: {
      label: customField?.label || "",
      description: customField?.description || "",
      placeholder: customField?.placeholder || "",
      type: props.type || props.customField?.type || supportedTypes[0],
      entities: props.customField?.entities || [],
      config: props.customField?.config || {},
      key: props.customField?.key || "",
      order: props.customField?.order || 0,
    },
    validate: {
      label: (value) => {
        if (!value) return t("required");
      },
      type: (value) => {
        if (!value) return t("required");
      },
      entities: (value) => {
        if (!value) return t("required");
        if (value.length === 0) return t("required");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      let customField: CustomFieldEntity;

      if (props.customField) {
        customField = await api.put(`/custom-fields/${props.customField._id}`, values);
      } else {
        customField = await api.post("/custom-fields", values);
      }

      if (customField) onSuccess?.(customField);
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onArchive = useCallback(async () => {
    if (!customField) return;
    try {
      await api.delete(`/custom-fields/${customField._id}`);
      props.onArchive?.();
    } catch (error) {
      onError(error);
    }
  }, [customField, props.onArchive]);

  return (
    <Form onSubmit={onSubmit}>
      <Stack>
        <TextInput autoFocus label={t("name")} {...form.getInputProps("label")} />

        <TextInput label={t("placeholder")} {...form.getInputProps("placeholder")} />

        <TextInput label={`Key (${t("optional")})`} {...form.getInputProps("key")} />

        <Textarea
          label={`${t("description")} (${t("optional")})`}
          {...form.getInputProps("description")}
        />

        <Select
          label={t("type")}
          {...form.getInputProps("type")}
          data={supportedTypes.map((type) => ({
            label: t(`custom_field_type_${type}`),
            value: type,
          }))}
        />

        <MultiSelect
          label={t("apply")}
          {...form.getInputProps("entities")}
          data={[
            AppEntity.PRODUCTS,
            AppEntity.POSTS,
            AppEntity.PROMOTIONS,
            AppEntity.TASKS,
            AppEntity.RECEIPTS,
            AppEntity.CUSTOMERS,
            AppEntity.LOANS,
            AppEntity.ORDERS,
          ].map((entity) => ({
            label: t(`entity_${entity}`),
            value: entity,
          }))}
        />

        <NumberInput label={t("sort_order")} {...form.getInputProps("order")} />

        <Center>
          <Button loading={form.submitting} type="submit">
            {t("save")}
          </Button>
        </Center>

        <ButtonArchive process={onArchive} enabled={!!customField} goBackWhenArchived={false} />
      </Stack>
    </Form>
  );
};
