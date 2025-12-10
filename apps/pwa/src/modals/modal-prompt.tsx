"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { onError } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { em, Group, MantineColor, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { Icon, IconCheck } from "@tabler/icons-react";
import { FC, ReactNode, useState } from "react";

interface ModalPromptProps {
  title: ReactNode;
  icon: Icon;
  color?: MantineColor;
  message: ReactNode;
  onSubmit: (content: string) => Promise<void>;
  suggestions?: string[];
}

export const ModalPrompt: FC<ModalPromptProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLingui();

  const form = useForm({
    initialValues: {
      content: "",
    },
    validate: {
      content: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    await props
      .onSubmit(values.content)
      .then(() => {
        modals.close("ModalPrompt");
      })
      .catch(onError);

    setIsSubmitting(false);
  });

  return (
    <Stack>
      <Textarea
        withAsterisk
        label={props.message}
        {...form.getInputProps("content")}
        color={props.color}
      />

      {props.suggestions && props.suggestions.length > 0 && (
        <Group gap={10}>
          {props.suggestions.map((s) => {
            return (
              <Button
                size="compact-xs"
                color="gray"
                variant="outline"
                fz={em(15)}
                fw={400}
                onClick={() => form.setFieldValue("content", s)}
              >
                {s}
              </Button>
            );
          })}
        </Group>
      )}

      <Button
        mt={10}
        loading={isSubmitting}
        onClick={() => onSubmit()}
        leftSection={<IconCheck strokeWidth={1.2} />}
        disabled={!form.isDirty()}
        type="submit"
        color={props.color}
      >
        <Trans>Complete</Trans>
      </Button>
    </Stack>
  );
};

export const OnModalPrompt = (props: ModalPromptProps) => {
  return modals.open({
    modalId: "ModalPrompt",
    title: <ModalHead name={props.title} icon={props.icon} color={props.color} />,
    children: <ModalPrompt {...props} />,
  });
};
