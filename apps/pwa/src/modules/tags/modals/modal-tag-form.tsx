import { Button } from "@/components/buttons/button";
import { TextInput } from "@/components/inputs/text-input";
import { ModalTitle } from "@/components/modal-title";
import { configs } from "@/configs/layout.config";
import { t } from "@/modules/lang/lang-service";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { onError } from "@/utils/exceptions.utils";
import { capitalize } from "@/utils/string.utils";
import { ActionIcon, ColorInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconFolderPlus, IconTag, IconX } from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";

interface ModalTagFormProps {
  onDone?: (tag: TagEntity) => void | Promise<void>;
  tag?: TagEntity;
  type: TagType;
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
      type: props.type,
    },
    validate: {
      name: (value: string) => {
        if (!value) return t("must_be_provided");
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
          label={t("name")}
          {...form.getInputProps("name")}
        />

        <ColorInput
          label={t("color")}
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
          {t("complete")}
        </Button>
      </Stack>
    </form>
  );
};

export const OnModalTagForm = (props: ModalTagFormProps) => {
  let icon = IconTag;
  if (props.type === TagType.TASK_FOLDER) icon = IconFolderPlus;
  const typeName = `${t(`tag_type_${props.type}`)}`.toLowerCase();

  return modals.open({
    modalId: "ModalTagForm",
    title: (
      <ModalTitle
        title={capitalize(props.tag ? `${t("update")} ${typeName}` : `${t("create")} ${typeName}`)}
        icon={icon}
      />
    ),
    children: <ModalTagForm {...props} />,
  });
};
