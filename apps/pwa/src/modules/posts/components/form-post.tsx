"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { CategoryEntity, CategoryType } from "@/modules/categories/category-types";
import { CategoryInput } from "@/modules/categories/components/category-input";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { CustomField, CustomFieldValue } from "@/modules/custom-fields/custom-field-types";
import { ProductInput, ProductValue } from "@/modules/products/components/product-input";
import { AppEntity } from "@/types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  InputWrapper,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCheck, IconEye } from "@tabler/icons-react";
import { type JSONContent } from "@tiptap/react";
import { type FC } from "react";
import { api } from "../../apis";
import { onUploadFile } from "../../files/file-service";
import { renderDateTime, t } from "../../lang/lang-service";
import { PostEntity } from "../posts-types";

interface FormPostProps {
  post?: PostEntity;
  onSuccess?: () => void;
}

export const FormPost: FC<FormPostProps> = ({ post, onSuccess }) => {
  const form = useForm<{
    title: string;
    slug: string;
    excerpt: string;
    content?: JSONContent | null;
    contentHtml?: string;
    thumbnail?: File;
    category?: CategoryEntity | null;
    customFields?: CustomField[];
    product: ProductValue | null;
  }>({
    initialValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || null,
      contentHtml: post?.contentHtml || "",
      category: post?.category,
      customFields: post?.customFields || [],
      product: post?.product ?? null,
    },
  });

  const autoGenerateSlug = useDebouncedCallback(async (title: string) => {
    try {
      if (!title) return;
      const response = await api.post<{ slug: string }>("/posts/slug", { title });
      form.setFieldValue("slug", response.slug);
    } catch (error) {
      onError(error);
    }
  }, 500);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const { thumbnail, category, customFields, product, ...dto } = values;

      const customFieldValues: CustomFieldValue[] =
        customFields?.map((customField) => ({
          customFieldId: customField.customFieldId,
          value: customField.value,
        })) || [];

      const thumbnailFile = values.thumbnail
        ? await onUploadFile({ file: values.thumbnail })
        : undefined;

      let _post: PostEntity | undefined = post;

      const payload = {
        ...dto,
        customFieldValues,
        thumbnail: thumbnailFile?.relativePath || post?.thumbnail,
        categoryId: category?._id || null,
        productId: product?._id || null,
      };

      if (post) {
        _post = await api.put<PostEntity>(`/posts/${post._id}`, payload);
      } else {
        _post = await api.post<PostEntity>("/posts", payload);
      }

      form.setInitialValues({
        title: _post?.title || "",
        slug: _post?.slug || "",
        excerpt: _post?.excerpt || "",
        content: _post?.content || null,
        contentHtml: _post?.contentHtml || "",
        category: _post?.category || null,
        customFields: _post?.customFields || [],
        product: _post?.product || null,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onPreview = () => {
    modals.open({
      title: <ModalTitle title={t("preview")} icon={IconEye} />,
      fullScreen: true,
      children: (
        <Group>
          <Box
            className="prose"
            dangerouslySetInnerHTML={{ __html: form.values.contentHtml || "" }}
          />
        </Group>
      ),
    });
  };

  const Actions: FC = () => {
    return (
      <Card shadow="sm">
        <Group justify="space-between">
          <Stack gap={4}>
            {post ? <Badge>{t("published")}</Badge> : <Badge color="gray">{t("draft")}</Badge>}
            {post?.updatedAt && (
              <Text fz={12} c="gray">
                {t("updatedAt")}: {renderDateTime(post.updatedAt)}
              </Text>
            )}
          </Stack>

          <Group gap={8}>
            <ActionIcon variant="light" size={34} radius={150} onClick={onPreview}>
              <IconEye size={16} />
            </ActionIcon>

            <Button
              disabled={!form.isDirty()}
              onClick={onSubmit}
              loading={form.submitting}
              leftIcon={IconCheck}
              radius={150}
            >
              {post ? t("update") : t("post_publish")}
            </Button>
          </Group>
        </Group>
      </Card>
    );
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack>
          <Renderer views={["mobile", "tablet"]}>
            <Actions />
          </Renderer>

          <Card shadow="sm" p={0}>
            <Stack gap={0}>
              <Stack p={12}>
                <InputWrapper {...form.getInputProps("title")} flex={1}>
                  <ContentEditable
                    value={form.values.title}
                    onChange={(value) => {
                      form.setFieldValue("title", value);
                      autoGenerateSlug(value);
                    }}
                    placeholder={t("enter_title")}
                    fz={25}
                  />
                </InputWrapper>
              </Stack>

              <Editor
                isAlwayShowToolbar
                placeholder={t("enter_content")}
                props={{
                  styles: {
                    root: {
                      border: "none",
                      borderRadius: 0,
                    },
                    content: {
                      minHeight: "60dvh",
                    },
                    toolbar: {
                      border: "none",
                      paddingBottom: 0,
                    },
                  },
                }}
                value={form.values.content}
                onChangeHTML={(value) => form.setFieldValue("contentHtml", value)}
                onChangeJSON={(value) => form.setFieldValue("content", value)}
              />
            </Stack>
          </Card>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack>
          <Renderer views={["desktop"]}>
            <Actions />
          </Renderer>

          <Card shadow="sm">
            <Stack>
              <TextInput label="Slug" {...form.getInputProps("slug")} />

              <InputWrapper label={t("post_thumbnail")}>
                <EntityImage
                  src={form.values.thumbnail || post?.thumbnail}
                  onChange={(value) => form.setFieldValue("thumbnail", value)}
                  w={300}
                  h={200}
                />
              </InputWrapper>

              <Textarea
                label={t("excerpt")}
                placeholder={t("enter_excerpt")}
                value={form.values.excerpt}
                onChange={(e) => form.setFieldValue("excerpt", e.target.value)}
              />

              <CategoryInput {...form.getInputProps("category")} />

              <ProductInput
                flex={1}
                label={t("link_entity", { entity: t("product") })}
                value={form.values.product}
                onChange={(value) => form.setFieldValue("product", value)}
              />

              <BuilderCustomFields
                entity={AppEntity.POSTS}
                value={form.values.customFields}
                onChange={(value) => form.setFieldValue("customFields", value)}
              />
            </Stack>
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
