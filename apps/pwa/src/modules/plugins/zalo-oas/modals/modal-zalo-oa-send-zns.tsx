"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import {
  PluginZaloOaZNSTemplateId,
  ZnsTemplateConfig,
} from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { isPhoneNumber } from "@/utils/phone.utils";
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
          if (!value) return t("required");
        };
        return acc;
      }, {} as any),
      phoneNumber: (value: string) => {
        if (!value) return t("required");
        if (!isPhoneNumber(value)) return t("invalid_phone_number");
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
        title: t("success"),
        message: t("zns_sent"),
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
            label={t(item.description)}
            description={item.fieldName}
            {...form.getInputProps(item.fieldName)}
          />
        );
      })}

      <TextInput withAsterisk label={t("phone")} {...form.getInputProps("phoneNumber")} />

      <Stack>
        <Checkbox
          size="sm"
          label={t("zns_testing")}
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
        onClick={onSubmit}
        leftSection={<IconSend strokeWidth={1.2} />}
        disabled={!form.isDirty()}
        type="submit"
      >
        {t("send")}
      </Button>
    </Stack>
  );
};

export const OnModalZaloOaSendZns = (props: ModalZaloOaSendZnsProps) => {
  return modals.open({
    modalId: "ModalZaloOaSendZns",
    title: <ModalTitle title={t("send_zns")} icon={IconPuzzle} />,
    children: <ModalZaloOaSendZns {...props} />,
  });
};
