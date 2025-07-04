"use client";

import { t } from "@/modules/lang/lang-service";
import { Center, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, type FC } from "react";
import { CategoryEntity, CategoryType } from "../category-types";
import { Button } from "@/components/buttons/button";
import { onUploadFile } from "@/modules/files/file-service";
import { api } from "@/modules/apis";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { Form } from "@/components/form";
import { ButtonArchive } from "@/components/buttons/button-archive";

export interface FormCategoryProps {
  category?: CategoryEntity;
  type?: CategoryType;
  onSuccess?: (category: CategoryEntity) => void;
  onArchive?: () => void;
}

export const FormCategory: FC<FormCategoryProps> = (props) => {
  const { category, onSuccess } = props;

  const form = useForm<{
    name?: string;
    slug?: string;
    type?: CategoryType;
    thumbnail?: File;
  }>({
    initialValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      type: props.type || props.category?.type,
    },
    validate: {
      name: (value) => {
        if (!value) return t("required");
      },
      type: (value) => {
        if (!value) return t("required");
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
      const thumbnail = values.thumbnail
        ? await onUploadFile({ file: values.thumbnail })
        : undefined;

      let category: CategoryEntity;

      if (props.category) {
        category = await api.put(`/categories/${props.category._id}`, {
          type: values.type,
          name: values.name,
          slug: values.slug,
          thumbnail: thumbnail?.relativePath || props.category.thumbnail,
        });
      } else {
        category = await api.post("/categories", {
          type: values.type,
          name: values.name,
          slug: values.slug,
          thumbnail: thumbnail?.relativePath,
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
    <Form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          autoFocus
          label={t("name")}
          {...form.getInputProps("name")}
          onChange={(e) => {
            form.setFieldValue("name", e.target.value);
            autoGenerateSlug(e.target.value);
          }}
        />

        <TextInput label={t("slug")} {...form.getInputProps("slug")} />

        <Select
          label={t("type")}
          {...form.getInputProps("type")}
          readOnly={!!props.type}
          data={Object.values(CategoryType).map((type) => ({
            label: t(`category_type_${type}`),
            value: type,
          }))}
        />

        <Center>
          <Button loading={form.submitting} type="submit">
            {t("save")}
          </Button>
        </Center>

        <ButtonArchive process={onArchive} enabled={!!category} goBackWhenArchived={false} />
      </Stack>
    </Form>
  );
};
