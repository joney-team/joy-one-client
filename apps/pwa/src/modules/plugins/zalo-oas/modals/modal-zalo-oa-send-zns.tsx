"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { PluginZaloOaZnsTemplateId } from "@/graphql/enums.graphql";
import { ZnsTemplateConfig } from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { isPhoneNumber } from "@/utils/phone.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Checkbox, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPuzzle, IconSend } from "@tabler/icons-react";
import { FC, useState } from "react";
import SendZNSDocument from "../graphql/sendZNS.graphql";

interface ModalZaloOaSendZnsProps {
  config: ZnsTemplateConfig;
  templateId: PluginZaloOaZnsTemplateId;
}

export const ModalZaloOaSendZns: FC<ModalZaloOaSendZnsProps> = (props) => {
  const { t } = useLingui();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(true);
  const color = useColor();
  const client = useApolloClient();

  const form = useForm({
    initialValues: props.config.fields.reduce((acc, item) => {
      acc[item.fieldName] = item.default || "";
      return acc;
    }, {} as any),
    validate: {
      ...props.config.fields.reduce((acc, item) => {
        acc[item.fieldName] = (value: string) => {
          if (!value) return t`Must be provided`;
        };
        return acc;
      }, {} as any),
      phoneNumber: (value: string) => {
        if (!value) return t`Must be provided`;
        if (!isPhoneNumber(value)) return t`Invalid phone number`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await client.mutate({
        mutation: SendZNSDocument,
        variables: {
          input: {
            data: props.config.fields.reduce(
              (acc, item) => {
                acc[item.fieldName] = values[item.fieldName];
                return acc;
              },
              {} as Record<string, any>,
            ),
            phoneNumber: values.phoneNumber,
            templateId: props.templateId,
            isTesting,
          },
        },
      });

      notifications.show({
        icon: <IconPuzzle size={18} strokeWidth={1.5} />,
        title: <Trans>Success</Trans>,
        message: <Trans>ZNS sent</Trans>,
        color: color("primary"),
      });
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack>
      {props.config.fields.map((item, index) => {
        return (
          <TextInput
            key={index}
            value={form.values[item.fieldName]}
            label={item.description}
            description={item.fieldName}
            {...form.getInputProps(item.fieldName)}
          />
        );
      })}

      <TextInput withAsterisk label={t`Phone number`} {...form.getInputProps("phoneNumber")} />

      <Stack>
        <Checkbox
          size="sm"
          label={t`ZNS testing`}
          checked={isTesting}
          onChange={() => setIsTesting(!isTesting)}
          styles={{
            label: { fontSize: 14 },
          }}
        />
      </Stack>

      <Button
        mt={10}
        loading={isSubmitting}
        onClick={() => onSubmit()}
        leftSection={<IconSend strokeWidth={1.2} />}
        disabled={!form.isDirty()}
        type="submit"
      >
        <Trans>Send</Trans>
      </Button>
    </Stack>
  );
};

export const OnModalZaloOaSendZns = (props: ModalZaloOaSendZnsProps) => {
  return modals.open({
    modalId: "ModalZaloOaSendZns",
    title: <ModalHead name={<Trans>Send ZNS</Trans>} icon={IconPuzzle} />,
    children: <ModalZaloOaSendZns {...props} />,
  });
};
