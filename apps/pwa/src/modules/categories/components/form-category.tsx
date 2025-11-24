"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { api } from "@/modules/apis";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { getCustomFieldValue } from "@/modules/custom-fields/custom-field-service";
import { CustomField } from "@/modules/custom-fields/custom-field-types";
import { AppEntity } from "@/types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Center, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { useCallback, type FC } from "react";
import { categoryTypes } from "../category-constants";
import { CategoryDto, CategoryEntity, CategoryType } from "../category-types";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";

export interface FormCategoryProps {
  category?: CategoryEntity;
  type?: CategoryType;
  onSuccess?: (category: CategoryEntity) => void;
  onArchive?: () => void;
}

export const FormCategory: FC<FormCategoryProps> = (props) => {
  const { category, onSuccess } = props;
  const uploadFile = useUploadFile();

  const form = useForm<{
    name: string;
    slug?: string;
    type?: CategoryType;
    thumbnail?: File;
    customFields?: CustomField[];
  }>({
    initialValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      type: props.type || props.category?.type,
      customFields: props.category?.customFields || [],
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
      const response = await api.post<{ slug: string }>("/categories/slug", { name });
      form.setFieldValue("slug", response.slug);
    } catch (error) {
      onError(error);
    }
  }, 500);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.name) return;
      const { customFields, thumbnail, ...rest } = values;

      const thumbnailValue = values.thumbnail ? await uploadFile(values.thumbnail) : undefined;

      let category: CategoryEntity;

      if (props.category) {
        category = await api.put<CategoryEntity, CategoryDto>(`/categories/${props.category._id}`, {
          ...rest,
          thumbnail: thumbnailValue?.path ?? props.category.thumbnail,
          customFieldValues: getCustomFieldValue(values.customFields),
        });
      } else {
        category = await api.post<CategoryEntity, CategoryDto>("/categories", {
          ...rest,
          thumbnail: thumbnailValue?.path,
          customFieldValues: getCustomFieldValue(values.customFields),
        });
      }

      if (category) onSuccess?.(category);
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onArchive = useCallback(async () => {
    if (!category) return;
    try {
      await api.delete(`/categories/${category._id}`);
      props.onArchive?.();
    } catch (error) {
      onError(error);
    }
  }, [category, props.onArchive]);

  return (
    <Form onSubmit={onSubmit} autoFocus={!props.category}>
      <Stack>
        <TextInput
          label={t`Name`}
          {...form.getInputProps("name")}
          onChange={(e) => {
            form.setFieldValue("name", e.target.value);
            autoGenerateSlug(e.target.value);
          }}
        />

        <TextInput label={t`Slug`} {...form.getInputProps("slug")} />

        <Select
          label={t`Type`}
          {...form.getInputProps("type")}
          readOnly={!!props.type}
          data={Object.values(CategoryType).map((type) => ({
            label: categoryTypes[type].label(),
            value: type,
          }))}
        />

        <BuilderCustomFields
          entity={AppEntity.CATEGORIES}
          value={form.values.customFields}
          onChange={(value) => form.setFieldValue("customFields", value)}
        />

        <Center>
          <Button loading={form.submitting} type="submit">
            {t`Save`}
          </Button>
        </Center>

        <ButtonArchive process={onArchive} enabled={!!category} goBackWhenArchived={false} />
      </Stack>
    </Form>
  );
};
