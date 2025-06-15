"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { EntityImage } from "@/components/entity-image";
import { Renderer } from "@/components/renderer";
import { CategoryInput } from "@/modules/categories/category-input";
import { CategoryEntity, CategoryType } from "@/modules/categories/category-types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import {
  Badge,
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
import { IconCheck } from "@tabler/icons-react";
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
    thumbnail?: File;
    category?: CategoryEntity | null;
  }>({
    initialValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || null,
      category: post?.category,
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
      const { thumbnail, category, ...dto } = values;

      const thumbnailFile = values.thumbnail
        ? await onUploadFile({ file: values.thumbnail })
        : undefined;

      let _post: PostEntity | undefined = post;

      if (post) {
        _post = await api.put<PostEntity>(`/posts/${post._id}`, {
          ...dto,
          thumbnail: thumbnailFile?.relativePath || post.thumbnail,
          categoryId: category?._id || null,
        });
      } else {
        _post = await api.post<PostEntity>("/posts", {
          ...dto,
          thumbnail: thumbnailFile?.relativePath,
          categoryId: category?._id || null,
        });
      }

      form.setInitialValues({
        title: _post?.title || "",
        slug: _post?.slug || "",
        excerpt: _post?.excerpt || "",
        content: _post?.content || null,
        category: _post?.category || null,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      onFormError(form, error);
    }
  });

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

              <CategoryInput type={CategoryType.POSTS} {...form.getInputProps("category")} />
            </Stack>
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
