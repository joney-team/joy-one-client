"use client";

import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { Modal } from "@/components/modal/modal";
import { configs } from "@/configs/layout.config";
import { TagType } from "@/graphql/enums.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Center, ColorInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";
import { TagFragment } from "../graphql/fragmentTag.graphql";
import BULK_UPDATE_TAGS_MUTATION, {
  type BulkUpdateTagsMutation,
  type BulkUpdateTagsMutationVariables,
} from "../graphql/mutationBulkUpdateTags.graphql";
import CREATE_TAG_MUTATION, {
  type CreateTagMutation,
  type CreateTagMutationVariables,
} from "../graphql/mutationCreateTag.graphql";
import QUERY_TAGS from "../graphql/queryTags.graphql";
import { tagTypes } from "../tags-constants";

type ModalTagFormProps =
  | {
      tag: TagFragment;
      onClose?: () => void;
    }
  | {
      onCreated?: (tag: TagFragment) => void | Promise<void>;
      onClose?: () => void;
      type: TagType;
    };

export interface ModalTagFormRef {
  open: (props?: ModalTagFormProps) => void;
}

export const ModalTagForm = forwardRef<
  ModalTagFormRef,
  {
    children?: (modal: {
      isOpened: boolean;
      onClose: () => void;
      open: (args?: ModalTagFormProps) => void;
    }) => ReactNode;
  }
>((props, ref) => {
  const [args, setArgs] = useState<ModalTagFormProps | null>(null);
  const { t } = useLingui();
  const initalTag = args && "tag" in args ? args.tag : undefined;
  const tagType = initalTag?.type ?? (args && "type" in args ? args.type : TagType.Task);

  const [createTag] = useMutation<CreateTagMutation, CreateTagMutationVariables>(
    CREATE_TAG_MUTATION,
  );

  const [bulkUpdateTags] = useMutation<BulkUpdateTagsMutation, BulkUpdateTagsMutationVariables>(
    BULK_UPDATE_TAGS_MUTATION,
  );

  const form = useForm<Partial<TagFragment>>({
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
    args?.onClose?.();
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
      {typeof props.children === "function"
        ? props.children({ isOpened: Boolean(args), onClose, open: onOpen })
        : null}

      <Modal
        id="tag-form"
        name={initalTag ? <Trans>Update {entity}</Trans> : <Trans>Create {entity}</Trans>}
        icon={TagIcon}
        opened={!!args}
        onClose={onClose}
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

              <Center mt="md">
                <Button leftIcon={IconCheck} loading={form.submitting} onClick={() => onSubmit()}>
                  <Trans>Save</Trans>
                </Button>
              </Center>
            </Stack>
          </Form>
        )}
      </Modal>
    </Fragment>
  );
});
