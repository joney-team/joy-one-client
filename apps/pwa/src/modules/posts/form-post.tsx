"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor";
import { EntityImage } from "@/components/entity-image";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { Card, Grid, Group, InputWrapper, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";
import { type JSONContent } from "@tiptap/react";
import { type FC } from "react";
import { api } from "../apis";
import { onUploadFile } from "../files/file-service";
import { t } from "../lang/lang-service";
import { PostEntity } from "./posts-types";

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
  }>({
    initialValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || null,
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
      const { thumbnail, ...dto } = values;

      const thumbnailFile = values.thumbnail
        ? await onUploadFile({ file: values.thumbnail })
        : undefined;

      let _post: PostEntity | undefined = post;

      if (post) {
        post = await api.put<PostEntity>(`/posts/${post._id}`, {
          ...dto,
          thumbnail: thumbnailFile?.relativePath || post.thumbnail,
        });
      } else {
        post = await api.post<PostEntity>("/posts", {
          ...dto,
          thumbnail: thumbnailFile?.relativePath,
        });
      }

      form.setInitialValues({
        title: _post?.title || "",
        slug: _post?.slug || "",
        excerpt: _post?.excerpt || "",
        content: _post?.content || null,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      onFormError(form, error);
    }
  });

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card shadow="sm" p={0}>
          <Stack gap={0}>
            <Group p={12}>
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

              <Button
                disabled={!form.isDirty()}
                onClick={onSubmit}
                loading={form.submitting}
                leftIcon={IconCheck}
              >
                {post ? t("update") : t("post_publish")}
              </Button>
            </Group>

            <Editor
              isAlwayShowToolbar
              placeholder={t("enter_content")}
              props={{
                styles: {
                  root: {
                    borderRight: "none",
                    borderLeft: "none",
                    borderBottom: "none",
                    borderRadius: 0,
                  },
                  content: {
                    minHeight: "60dvh",
                  },
                },
              }}
              value={form.values.content}
              onChangeJSON={(value) => form.setFieldValue("content", value)}
            />
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
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
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
};
