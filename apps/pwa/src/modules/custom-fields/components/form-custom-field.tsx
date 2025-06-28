"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { Center, MultiSelect, Select, Stack, Textarea, TextInput } from "@mantine/core";
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

export const FormCustomField: FC<FormCustomFieldProps> = (props) => {
  const { customField, onSuccess } = props;

  const form = useForm<{
    label?: string;
    description?: string;
    type?: CustomFieldType;
    entities?: AppEntity[];
    config?: any;
  }>({
    initialValues: {
      label: customField?.label || "",
      description: customField?.description || "",
      type: props.type || props.customField?.type,
      entities: props.customField?.entities || [],
      config: props.customField?.config || {},
    },
    validate: {
      label: (value) => {
        if (!value) return t("required");
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

        <Textarea label={t("description")} {...form.getInputProps("description")} />

        <Select
          label={t("type")}
          {...form.getInputProps("type")}
          data={Object.values(CustomFieldType).map((type) => ({
            label: t(`custom_field_type_${type}`),
            value: type,
          }))}
        />

        <MultiSelect
          label={t("apply")}
          {...form.getInputProps("entities")}
          data={Object.values(AppEntity).map((entity) => ({
            label: t(`entity_${entity}`),
            value: entity,
          }))}
        />

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
