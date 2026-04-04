"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { CategoryType } from "@/graphql/enums.graphql";
import { CategoryInput, CustomFieldValue } from "@/graphql/types.graphql";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { AppEntity } from "@/types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Center, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { useCallback, type FC } from "react";
import { categoryTypes } from "../category-constants";
import CreateCategoryDocument from "../graphql/createCategory.graphql";
import DeleteCategoryDocument from "../graphql/deleteCategory.graphql";
import { CategoryFragment } from "../graphql/fragmentCategory.graphql";
import GenerateCategorySlugDocument from "../graphql/generateCategorySlug.graphql";
import UpdateCategoryDocument from "../graphql/updateCategory.graphql";

export interface FormCategoryProps {
  category?: CategoryFragment;
  type?: CategoryType;
  onSuccess?: (category: CategoryFragment) => void;
  onArchive?: () => void;
}

export const FormCategory: FC<FormCategoryProps> = (props) => {
  const { category, onSuccess } = props;
  const uploadFile = useUploadFile();
  const client = useApolloClient();
  const { t } = useLingui();

  const form = useForm<{
    name: string;
    slug?: string;
    type?: CategoryType;
    thumbnail?: File;
    customFieldValues?: CustomFieldValue[];
  }>({
    initialValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      type: props.type || props.category?.type,
      customFieldValues: props.category?.customFieldValues || [],
    },
    validate: {
      name: (value) => {
        if (!value) return t`Must be provided`;
      },
      type: (value) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const autoGenerateSlug = useDebouncedCallback(async (name: string) => {
    try {
      if (!name) return;
      const response = await client.mutate({
        mutation: GenerateCategorySlugDocument,
        variables: {
          input: {
            name,
          },
        },
      });
      form.setFieldValue("slug", response.data?.slug);
    } catch (error) {
      onError(error);
    }
  }, 500);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.name) return;
      const thumbnailValue = values.thumbnail ? await uploadFile(values.thumbnail) : undefined;

      let category: CategoryFragment | undefined;

      const input: CategoryInput = {
        name: values.name,
        slug: values.slug,
        type: values.type!,
        customFieldValues: values.customFieldValues,
        thumbnail: thumbnailValue?.path ?? category?.thumbnail,
      };

      if (props.category) {
        category = await client
          .mutate({
            mutation: UpdateCategoryDocument,
            variables: {
              input,
              categoryId: props.category._id,
            },
          })
          .then((result) => result.data?.category);
      } else {
        category = await client
          .mutate({
            mutation: CreateCategoryDocument,
            variables: {
              input,
            },
          })
          .then((result) => result.data?.category);
      }

      if (category) onSuccess?.(category);
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onArchive = useCallback(async () => {
    if (!category) return;
    try {
      await client.mutate({
        mutation: DeleteCategoryDocument,
        variables: {
          categoryId: category._id,
        },
      });
      props.onArchive?.();
    } catch (error) {
      onError(error);
    }
  }, [category, props.onArchive]);

  return (
    <Form onSubmit={onSubmit} autoFocus={!props.category}>
      <Stack>
        <TextInput
          label={<Trans>Name</Trans>}
          {...form.getInputProps("name")}
          onChange={(e) => {
            form.setFieldValue("name", e.target.value);
            autoGenerateSlug(e.target.value);
          }}
        />

        <TextInput label={<Trans>Slug</Trans>} {...form.getInputProps("slug")} />

        <Select
          label={<Trans>Type</Trans>}
          {...form.getInputProps("type")}
          readOnly={!!props.type}
          data={Object.values(CategoryType).map((type) => ({
            label: t(categoryTypes[type].label),
            value: type,
          }))}
        />

        <BuilderCustomFields
          entity={AppEntity.CATEGORIES}
          value={form.values.customFieldValues}
          onChange={(value) => form.setFieldValue("customFieldValues", value)}
        />

        <Center>
          <Button loading={form.submitting} type="submit">
            <Trans>Save</Trans>
          </Button>
        </Center>

        <ButtonArchive process={onArchive} enabled={!!category} goBackWhenArchived={false} />
      </Stack>
    </Form>
  );
};
