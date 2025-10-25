"use client";

import { Button } from "@/components/buttons/button";
import { onError, onFormErrorLegacy } from "@/utils/exceptions.utils";
import { Anchor, Center, em, PasswordInput, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconLock, IconMail } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useState } from "react";
import { tl } from "@/modules/lang/lang-service";
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
        if (!v) return tl("must_be_provided");
      },
      plainPassword: (v: string) => {
        if (!isVerified) return null;
        if (!v) return tl("must_be_provided");
        if (v.length < 6) return tl("password_length", { length: 6 });
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
          title: `${tl("notification")}`,
          message: tl("sent_verification_code"),
          icon: <IconMail strokeWidth={1.5} size={18} />,
        });
      } else {
        await renewPassword(values);
        notifications.show({
          autoClose: true,
          title: tl("success"),
          message: tl("change_password_success"),
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
                <Text ta="center">{tl("enter_new_password")}</Text>

                <PasswordInput
                  label={tl("new_password")}
                  size="md"
                  placeholder={tl("password_length", { length: 6 }) as string}
                  leftSection={<IconLock strokeWidth={1.5} size={18} />}
                  {...form.getInputProps("plainPassword")}
                />

                <Button mt={16} loading={isSubmitting} type="submit" h={42}>
                  {tl("change_password")}
                </Button>
              </Fragment>
            );
          }

          if (isSent)
            return (
              <Fragment>
                <Text ta="center">{tl("forgot_password_msg")}</Text>

                <Center>
                  <PinInput length={6} oneTimeCode onComplete={onVerify} size="md" type="number" />
                </Center>

                <Anchor ta="center" onClick={() => onSubmit()} mt={16} fz={em(14)}>
                  {tl("resend_verification_code")}
                </Anchor>
              </Fragment>
            );

          return (
            <Fragment>
              <TextInput
                label="Email"
                size="md"
                placeholder={tl("enter_your_email") as string}
                {...form.getInputProps("email")}
                leftSection={<IconMail strokeWidth={1.5} size={18} />}
                autoFocus
              />

              <Button mt={16} loading={isSubmitting} type="submit">
                {tl("next")}
              </Button>
            </Fragment>
          );
        })()}
      </Stack>
    </form>
  );
};
