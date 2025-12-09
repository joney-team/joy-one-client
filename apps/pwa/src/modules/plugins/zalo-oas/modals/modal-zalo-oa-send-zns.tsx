"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { api } from "@/modules/apis";
import {
  PluginZaloOaZNSTemplateId,
  ZnsTemplateConfig,
} from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { isPhoneNumber } from "@/utils/phone.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Checkbox, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPuzzle, IconSend } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ModalZaloOaSendZnsProps {
  config: ZnsTemplateConfig;
  templateId: PluginZaloOaZNSTemplateId;
}

export const ModalZaloOaSendZns: FC<ModalZaloOaSendZnsProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(true);
  const color = useColor();

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
      await api.post(`/plugins/zalo-oas/zns`, {
        data: props.config.fields.reduce((acc, item) => {
          acc[item.fieldName] = values[item.fieldName];
          return acc;
        }, {} as any),
        phoneNumber: values.phoneNumber,
        templateId: props.templateId,
        isTesting,
      });

      notifications.show({
        icon: <IconPuzzle size={18} strokeWidth={1.5} />,
        title: t`Success`,
        message: t`ZNS sent`,
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
    title: <ModalTitle title={<Trans>Send ZNS</Trans>} icon={IconPuzzle} />,
    children: <ModalZaloOaSendZns {...props} />,
  });
};
