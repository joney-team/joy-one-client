"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Editor } from "@/components/editor/editor";
import { DateFormat } from "@/components/format/date-format";
import { ImageInput } from "@/components/inputs/image-input";
import { ModalHead } from "@/components/modal/modal-head";
import { Renderer } from "@/components/renderer";
import { CustomFieldValue, PostInput } from "@/graphql/types.graphql";
import { CategoryInput } from "@/modules/categories/components/category-input";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { getCustomFieldValue } from "@/modules/custom-fields/custom-field-service";
import { AppEntity } from "@/types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
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
import { generateHTML, type JSONContent } from "@tiptap/react";
import { type FC } from "react";
import CreatePostDocument from "../graphql/createPost.graphql";
import { PostFragment } from "../graphql/fragmentPost.graphql";
import GeneratePostSlugDocument from "../graphql/generatePostSlug.graphql";
import UpdatePostDocument from "../graphql/updatePost.graphql";

interface FormPostProps {
  post?: PostFragment;
  onSuccess?: (post: PostFragment) => void;
}

export const FormPost: FC<FormPostProps> = ({ post, onSuccess }) => {
  const { t } = useLingui();
  const client = useApolloClient();

  const form = useForm<{
    title: string;
    slug: string;
    excerpt: string;
    content?: JSONContent | null;
    thumbnail?: string;
    category?: PostFragment["category"];
    customFieldValues?: CustomFieldValue[];
  }>({
    initialValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || null,
      category: post?.category,
      customFieldValues: post?.customFieldValues || [],
      thumbnail: post?.thumbnail || "",
    },
  });

  const autoGenerateSlug = useDebouncedCallback(async (title: string) => {
    try {
      if (!title) return;
      const response = await client.query({
        query: GeneratePostSlugDocument,
        variables: { input: { title } },
        fetchPolicy: "network-only",
      });
      form.setFieldValue("slug", response.data?.slug ?? "");
    } catch (error) {
      onError(error);
    }
  }, 500);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const { category, customFieldValues, ...rest } = values;

      let postData: PostFragment | undefined = post;

      const input: PostInput = {
        ...rest,
        customFieldValues: getCustomFieldValue(customFieldValues),
        categoryId: category?._id || null,
        content: values.content || null,
        contentHtml: null,
      };

      if (post) {
        postData = await client
          .mutate({
            mutation: UpdatePostDocument,
            variables: { postId: post._id, input },
          })
          .then((result) => result.data?.post);
      } else {
        postData = await client
          .mutate({
            mutation: CreatePostDocument,
            variables: { input },
          })
          .then((result) => result.data?.post);
      }

      form.setInitialValues({
        title: postData?.title || "",
        slug: postData?.slug || "",
        excerpt: postData?.excerpt || "",
        content: postData?.content || null,
        category: postData?.category || null,
        customFieldValues: postData?.customFieldValues || [],
        thumbnail: postData?.thumbnail || "",
      });

      form.reset();
      if (postData) onSuccess?.(postData);
    } catch (error) {
      onFormError(form, error);
    }
  });

  const onPreview = () => {
    modals.open({
      title: <ModalHead name={<Trans>Preview</Trans>} icon={IconEye} />,
      fullScreen: true,
      children: (
        <Group>
          <Box
            className="prose"
            dangerouslySetInnerHTML={{
              __html: form.values.content ? generateHTML(form.values.content, []) : "",
            }}
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
            {post ? (
              <Badge>
                <Trans>Published</Trans>
              </Badge>
            ) : (
              <Badge color="gray">
                <Trans>Draft</Trans>
              </Badge>
            )}
            {post?.updatedAt && (
              <Text fz={12} c="gray">
                <Trans>Updated at</Trans>: <DateFormat value={post.updatedAt} type="date-time" />
              </Text>
            )}
          </Stack>

          <Group gap={8}>
            <ActionIcon variant="light" size={34} radius={150} onClick={onPreview}>
              <IconEye size={16} />
            </ActionIcon>

            <Button
              disabled={!form.isDirty()}
              onClick={() => onSubmit()}
              loading={form.submitting}
              leftIcon={IconCheck}
              radius={150}
            >
              {post ? <Trans>Update</Trans> : <Trans>Publish</Trans>}
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

          <Card shadow="sm" p={0} style={{ overflow: "unset !important" }}>
            <Stack gap={0}>
              <Stack p={12}>
                <InputWrapper {...form.getInputProps("title")} flex={1}>
                  <ContentEditable
                    value={form.values.title}
                    onChange={(value) => {
                      form.setFieldValue("title", value);
                      autoGenerateSlug(value);
                    }}
                    placeholder={t`Enter title`}
                    fz={25}
                  />
                </InputWrapper>
              </Stack>

              <Editor
                isEnableToolbar
                isRawContent
                placeholder={t`Enter content`}
                styles={{
                  root: {
                    border: "none",
                    borderRadius: 0,
                  },
                  content: {
                    minHeight: "60dvh",
                  },
                }}
                defaultValue={form.values.content}
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

              <InputWrapper label={<Trans>Thumbnail</Trans>}>
                <ImageInput
                  value={(form.values.thumbnail || post?.thumbnail) ?? ""}
                  onChange={(value) => form.setFieldValue("thumbnail", value)}
                  w="100%"
                  h={200}
                />
              </InputWrapper>

              <Textarea
                label={<Trans>Excerpt</Trans>}
                placeholder={t`Enter excerpt`}
                value={form.values.excerpt}
                onChange={(e) => form.setFieldValue("excerpt", e.target.value)}
              />

              <CategoryInput {...form.getInputProps("category")} />

              <BuilderCustomFields
                entity={AppEntity.POSTS}
                value={form.values.customFieldValues}
                onChange={(value) => form.setFieldValue("customFieldValues", value)}
              />
            </Stack>
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
