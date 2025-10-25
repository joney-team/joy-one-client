"use client";

import { Button } from "@/components/buttons/button";
import { onError, onFormErrorLegacy } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Anchor, Center, em, PasswordInput, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconLock, IconMail } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useState } from "react";
import { renewPassword, requestRenewPassword, verifyRenewPasswordCode } from "../auth-service";

export const FormForgotPassword: FC<{ onFinish: () => void }> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      plainPassword: "",
      code: "",
    },
    validate: {
      email: (v: string) => {
        if (!v) return t`Must be provided`;
      },
      plainPassword: (v: string) => {
        if (!isVerified) return null;
        if (!v) return t`Must be provided`;
        if (v.length < 6) return t`Password must contain at least ${6} characters`;
      },
    },
  });

  useEffect(() => {
    if (form.values.email !== "") {
      form.setFieldValue("email", form.values.email.toLowerCase());
    }
  }, [form.values.email]);

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (!isVerified) {
        await requestRenewPassword(values);
        setIsSent(true);
        notifications.show({
          autoClose: true,
          title: t`Notification`,
          message: t`Verification code sent to your email.`,
          icon: <IconMail strokeWidth={1.5} size={18} />,
        });
      } else {
        await renewPassword(values);
        notifications.show({
          autoClose: true,
          title: t`Success`,
          message: t`Password changed successfully.`,
          icon: <IconLock strokeWidth={1.5} size={18} />,
        });
        props.onFinish();
      }
    } catch (error) {
      onFormErrorLegacy(form)(error);
    }
    setIsSubmitting(false);
  });

  const onVerify = async (code: string) => {
    try {
      await verifyRenewPasswordCode({ code });
      form.setFieldValue("code", code);
      setIsVerified(true);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        {(function () {
          if (isVerified) {
            return (
              <Fragment>
                <Text ta="center">{t`Enter new password`}</Text>

                <PasswordInput
                  label={t`New password`}
                  size="md"
                  placeholder={t`Password must contain at least ${6} characters` as string}
                  leftSection={<IconLock strokeWidth={1.5} size={18} />}
                  {...form.getInputProps("plainPassword")}
                />

                <Button mt={16} loading={isSubmitting} type="submit" h={42}>
                  {t`Change password`}
                </Button>
              </Fragment>
            );
          }

          if (isSent)
            return (
              <Fragment>
                <Text ta="center">{t`Forgot password message`}</Text>

                <Center>
                  <PinInput length={6} oneTimeCode onComplete={onVerify} size="md" type="number" />
                </Center>

                <Anchor ta="center" onClick={() => onSubmit()} mt={16} fz={em(14)}>
                  {t`Resend verification code`}
                </Anchor>
              </Fragment>
            );

          return (
            <Fragment>
              <TextInput
                label="Email"
                size="md"
                placeholder={t`Enter your email` as string}
                {...form.getInputProps("email")}
                leftSection={<IconMail strokeWidth={1.5} size={18} />}
                autoFocus
              />

              <Button mt={16} loading={isSubmitting} type="submit">
                {t`Next`}
              </Button>
            </Fragment>
          );
        })()}
      </Stack>
    </form>
  );
};
