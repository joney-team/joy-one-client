"use client";

import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { ModalTitle } from "@/components/modal-title";
import { configs } from "@/configs/layout.config";
import { TagType } from "@/graphql/enums.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, ColorInput, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";
import { TagDataFragment } from "../queries/fragmentTag.graphql";
import BULK_UPDATE_TAGS_MUTATION, {
  type BulkUpdateTagsMutation,
  type BulkUpdateTagsMutationVariables,
} from "../queries/mutationBulkUpdateTags.graphql";
import CREATE_TAG_MUTATION, {
  type CreateTagMutation,
  type CreateTagMutationVariables,
} from "../queries/mutationCreateTag.graphql";
import QUERY_TAGS from "../queries/queryTags.graphql";
import { tagTypes } from "../tags-constants";

type ModalTagFormProps =
  | {
      tag: TagDataFragment;
    }
  | {
      onCreated?: (tag: Pick<TagDataFragment, "_id" | "slug">) => void | Promise<void>;
      type: TagType;
    };

export interface ModalTagFormRef {
  open: (props?: ModalTagFormProps) => void;
}

export const ModalTagForm = forwardRef<
  ModalTagFormRef,
  {
    children: (open: (args?: ModalTagFormProps) => void) => ReactNode;
  }
>((props, ref) => {
  const [args, setArgs] = useState<ModalTagFormProps | null>(null);
  const { t } = useLingui();
  const initalTag = args && "tag" in args ? args.tag : undefined;
  const tagType = initalTag?.type ?? (args && "type" in args ? args.type : TagType.Task);

  const [createTag] = useMutation<CreateTagMutation, CreateTagMutationVariables>(
    CREATE_TAG_MUTATION
  );

  const [bulkUpdateTags] = useMutation<BulkUpdateTagsMutation, BulkUpdateTagsMutationVariables>(
    BULK_UPDATE_TAGS_MUTATION
  );

  const form = useForm<Partial<TagDataFragment>>({
    initialValues: {},
    validate: {
      name: (value?: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onOpen = (a?: ModalTagFormProps) => {
    form.setInitialValues(a && "tag" in a ? { ...a.tag } : { name: "" });
    form.reset();
    setArgs(a ?? null);
  };

  const onClose = () => {
    setArgs(null);
  };

  useImperativeHandle(ref, () => ({
    open: onOpen,
  }));

  const onSubmit = form.onSubmit(async (values) => {
    if (!tagType) return;

    try {
      if (initalTag) {
        await bulkUpdateTags({
          variables: {
            items: [
              {
                _id: initalTag._id,
                name: values.name,
                color: values.color,
              },
            ],
          },
          awaitRefetchQueries: true,
        });
      } else {
        if (!values.name) return;
        const result = await createTag({
          variables: {
            input: {
              name: values.name,
              type: tagType,
              ...values,
            },
          },
          refetchQueries: [QUERY_TAGS],
          awaitRefetchQueries: true,
        });

        if (result.data?.createTag && args && "onCreated" in args) {
          args.onCreated?.(result.data.createTag);
        }
      }
      onClose();
    } catch (error) {
      onError(error);
    }
  });

  const TagIcon = useMemo(() => {
    return tagType ? tagTypes[tagType].icon : undefined;
  }, [tagType]);

  const entity = useMemo(() => {
    return tagType ? t(tagTypes[tagType].label) : "";
  }, [tagType]);

  return (
    <Fragment>
      {typeof props.children === "function" ? props.children(onOpen) : null}

      <Modal
        opened={!!args}
        onClose={onClose}
        title={
          <ModalTitle
            title={initalTag ? <Trans>Update {entity}</Trans> : <Trans>Create {entity}</Trans>}
            icon={TagIcon}
            titleProps={{ tt: "capitalizes" }}
          />
        }
      >
        {!!args && (
          <Form onSubmit={onSubmit}>
            <Stack>
              <TextInput withAsterisk label={<Trans>Name</Trans>} {...form.getInputProps("name")} />

              <ColorInput
                label={<Trans>Color</Trans>}
                {...form.getInputProps("color")}
                format="hex"
                swatches={configs.swatches}
                rightSection={
                  form.values.color && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={() => form.setFieldValue("color", "")}
                    >
                      <IconX strokeWidth={1.5} size={18} />
                    </ActionIcon>
                  )
                }
              />

              <Button
                mt="md"
                leftIcon={IconCheck}
                type="submit"
                loading={form.submitting}
                onClick={onSubmit}
              >
                <Trans>Save</Trans>
              </Button>
            </Stack>
          </Form>
        )}
      </Modal>
    </Fragment>
  );
});
