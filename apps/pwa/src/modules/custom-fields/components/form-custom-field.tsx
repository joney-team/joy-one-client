"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { api } from "@/modules/apis";
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
import { t } from "@lingui/core/macro";
import { customFieldTypes } from "../custom-field-constants";
import { appEntities } from "@/constant";
import { Trans } from "@lingui/react/macro";

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
        if (!value) return t`Must be provided`;
      },
      type: (value) => {
        if (!value) return t`Must be provided`;
      },
      entities: (value) => {
        if (!value) return t`Must be provided`;
        if (value.length === 0) return t`Must be provided`;
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
        <TextInput autoFocus label={t`Name`} {...form.getInputProps("label")} />

        <TextInput label={t`Placeholder`} {...form.getInputProps("placeholder")} />

        <TextInput label={`Key (${t`optional`})`} {...form.getInputProps("key")} />

        <Textarea
          label={`${t`Description`} (${t`optional`})`}
          {...form.getInputProps("description")}
        />

        <Select
          label={t`Type`}
          {...form.getInputProps("type")}
          data={supportedTypes.map((type) => ({
            label: customFieldTypes[type].label(),
            value: type,
          }))}
        />

        <MultiSelect
          label={t`Apply`}
          {...form.getInputProps("entities")}
          data={[
            AppEntity.PRODUCTS,
            AppEntity.POSTS,
            AppEntity.CATEGORIES,
            AppEntity.PROMOTIONS,
            // AppEntity.TASKS,
            AppEntity.RECEIPTS,
            AppEntity.CUSTOMERS,
            AppEntity.LOANS,
            AppEntity.ORDERS,
          ].map((entity) => ({
            label: appEntities[entity].name(),
            value: entity,
          }))}
        />

        <NumberInput label={t`Sort order`} {...form.getInputProps("order")} />

        <Center>
          <Button loading={form.submitting} type="submit">
            <Trans>Save</Trans>
          </Button>
        </Center>

        <ButtonArchive process={onArchive} enabled={!!customField} goBackWhenArchived={false} />
      </Stack>
    </Form>
  );
};
