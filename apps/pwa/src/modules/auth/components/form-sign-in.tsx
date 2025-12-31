"use client";

import { Button } from "@/components/buttons/button";
import { useAuth } from "@/modules/auth/auth-context";
import { onError, onFormError, onFormErrorLegacy } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconMail } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

export const FormSignIn: FC<{ onForgotPassword: () => void }> = (props) => {
  const auth = useAuth();
  const { t } = useLingui();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      plainPassword: "",
    },
    validate: {
      email: (v: string) => {
        if (!v) return t`Must be provided`;
      },
      plainPassword: (v: string) => {
        if (!v) return t`Must be provided`;
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
    await auth
      .signInWithEmailAndPassword({
        email: values.email,
        password: values.plainPassword,
      })
      .catch(() => {
        throw new Error(t`Incorrect login information`);
      })
      .catch((error) => onError(error));
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label="Email"
          size="md"
          placeholder={t`Enter your email`}
          {...form.getInputProps("email")}
          leftSection={<IconMail strokeWidth={1.5} size={18} />}
          autoFocus
        />

        <PasswordInput
          label={<Trans>Password</Trans>}
          size="md"
          {...form.getInputProps("plainPassword")}
          placeholder={t`Enter your password`}
          leftSection={<IconLock strokeWidth={1.5} size={18} />}
        />

        <Button mt="md" loading={isSubmitting} type="submit" size="md">
          <Trans>Login</Trans>
        </Button>

        <Anchor onClick={props.onForgotPassword} ta="center" mt="md" fz="sm">
          <Trans>Forgot password</Trans>?
        </Anchor>
      </Stack>
    </form>
  );
};
