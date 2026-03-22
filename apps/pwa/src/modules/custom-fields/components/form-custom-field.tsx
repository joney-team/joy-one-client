"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { appEntities } from "@/constant";
import { restClient } from "@/modules/apis/rest-client";
import { AppEntity } from "@/types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { customFieldTypes } from "../custom-field-constants";
import { CustomFieldEntity, CustomFieldType } from "../custom-field-types";

export interface FormCustomFieldProps {
  customField?: CustomFieldEntity;
  type?: CustomFieldType;
  onSuccess?: (customField: CustomFieldEntity) => void;
  onArchive?: () => void;
}

const supportedTypes = [CustomFieldType.TEXT, CustomFieldType.NUMBER, CustomFieldType.SWITCH];

export const FormCustomField: FC<FormCustomFieldProps> = (props) => {
  const { customField, onSuccess } = props;
  const { t } = useLingui();

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
        customField = await restClient.put(`/custom-fields/${props.customField._id}`, values);
      } else {
        customField = await restClient.post("/custom-fields", values);
      }

      if (customField) onSuccess?.(customField);
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onArchive = useCallback(async () => {
    if (!customField) return;
    try {
      await restClient.delete(`/custom-fields/${customField._id}`);
      props.onArchive?.();
    } catch (error) {
      onError(error);
    }
  }, [customField, props.onArchive]);

  return (
    <Form onSubmit={onSubmit}>
      <Stack>
        <TextInput autoFocus label={<Trans>Name</Trans>} {...form.getInputProps("label")} />

        <TextInput label={<Trans>Placeholder</Trans>} {...form.getInputProps("placeholder")} />

        <TextInput label={`Key (${t`Optional`.toLowerCase()})`} {...form.getInputProps("key")} />

        <Textarea
          label={`${t`Description`} (${t`Optional`.toLowerCase()})`}
          {...form.getInputProps("description")}
        />

        <Select
          label={<Trans>Type</Trans>}
          {...form.getInputProps("type")}
          data={supportedTypes.map((type) => ({
            label: customFieldTypes[type].label(),
            value: type,
          }))}
        />

        <MultiSelect
          label={<Trans>Apply</Trans>}
          {...form.getInputProps("entities")}
          data={[
            AppEntity.PRODUCTS,
            AppEntity.POSTS,
            AppEntity.CATEGORIES,
            AppEntity.PROMOTIONS,
            AppEntity.RECEIPTS,
            AppEntity.CUSTOMERS,
            AppEntity.LOANS,
            AppEntity.ORDERS,
          ].map((entity) => ({
            label: t(appEntities[entity].name),
            value: entity,
          }))}
        />

        <NumberInput label={<Trans>Sort order</Trans>} {...form.getInputProps("order")} />

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
