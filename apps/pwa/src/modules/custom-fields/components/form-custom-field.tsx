"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { appEntities } from "@/constant";
import { CustomFieldType } from "@/graphql/enums.graphql";
import { CustomFieldInput } from "@/graphql/types.graphql";
import { AppEntity } from "@/types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
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
import CreateCustomFieldDocument from "../graphql/createCustomField.graphql";
import DeleteCustomFieldDocument from "../graphql/deleteCustomField.graphql";
import { CustomFieldFragment } from "../graphql/fragmentCustomField.graphql";
import UpdateCustomFieldDocument from "../graphql/updateCustomField.graphql";

export interface FormCustomFieldProps {
  customField?: CustomFieldFragment;
  type?: CustomFieldType;
  onSuccess?: (customField: CustomFieldFragment) => void;
  onArchive?: () => void;
}

const supportedTypes = [CustomFieldType.Text, CustomFieldType.Number, CustomFieldType.Switch];

export const FormCustomField: FC<FormCustomFieldProps> = (props) => {
  const client = useApolloClient();
  const { customField, onSuccess } = props;
  const { t } = useLingui();

  const form = useForm<CustomFieldInput>({
    initialValues: {
      label: customField?.label || "",
      description: customField?.description || "",
      placeholder: customField?.placeholder || "",
      type: props.type || props.customField?.type || supportedTypes[0],
      entities: (props.customField?.entities || []) as AppEntity[],
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
      let customField: CustomFieldFragment;

      if (props.customField) {
        customField = await client
          .mutate({
            mutation: UpdateCustomFieldDocument,
            variables: {
              input: values,
              updateCustomFieldId: props.customField._id,
            },
          })
          .then((result) => result.data?.customField!);
      } else {
        customField = await client
          .mutate({
            mutation: CreateCustomFieldDocument,
            variables: {
              input: values,
            },
          })
          .then((result) => result.data?.customField!);
      }

      if (customField) onSuccess?.(customField);
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onArchive = useCallback(async () => {
    if (!customField) return;
    try {
      await client.mutate({
        mutation: DeleteCustomFieldDocument,
        variables: { deleteCustomFieldId: customField._id },
      });
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
            label: t(customFieldTypes[type].label),
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
