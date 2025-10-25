"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { configs } from "@/configs/layout.config";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, ColorInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconX } from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";
import { tagTypes } from "../tags-constants";

interface ModalTagFormProps {
  onDone?: (tag: TagEntity) => void | Promise<void>;
  tag?: TagEntity;
  type?: TagType;
}

export const ModalTagForm: FC<ModalTagFormProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tags = useTags();
  const inputNameRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    initialValues: {
      ...props.tag,
      name: props.tag?.name || "",
      color: props.tag?.color || "",
      type: props.type || props.tag?.type,
    },
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    const action = props.tag
      ? () => tags.update(props.tag!._id, values as any)
      : () =>
          tags.create({
            ...values,
            type: props.type,
          } as any);

    await action()
      .then(async (res) => {
        await props.onDone?.(res);
        modals.close("ModalTagForm");
      })
      .catch(onError);

    setIsSubmitting(false);
  });

  useEffect(() => {
    setTimeout(() => {
      if (inputNameRef.current && !props.tag) {
        inputNameRef.current!.focus();
      }
    }, 100);
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          withAsterisk
          ref={inputNameRef}
          label={t`Name`}
          {...form.getInputProps("name")}
        />

        <Select
          label={t`Type`}
          disabled={!!props.type}
          data={Object.values(TagType).map((type) => ({
            label: tagTypes[type].label(),
            value: type,
          }))}
          {...form.getInputProps("type")}
        />

        <ColorInput
          label={t`Color`}
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
          mt={10}
          loading={isSubmitting}
          leftSection={<IconCheck strokeWidth={1.2} />}
          disabled={!form.isDirty()}
          type="submit"
        >
          <Trans>Complete</Trans>
        </Button>
      </Stack>
    </form>
  );
};

export const OnModalTagForm = (props: ModalTagFormProps) => {
  return modals.open({
    modalId: "ModalTagForm",
    title: (
      <ModalTitle
        title={props.tag ? t`Update tag` : t`Create tag`}
        icon={props.type ? tagTypes[props.type].icon : undefined}
      />
    ),
    children: <ModalTagForm {...props} />,
  });
};
