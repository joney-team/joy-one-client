"use client";

import { Button } from "@/components/buttons/button";
import { useAuth } from "@/modules/auth/auth-context";
import { onFormError, onFormErrorLegacy } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

export const FormRegister: FC = () => {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLingui();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      plainPassword: "",
    },
    validate: {
      name: (v: string) => {
        if (!v) return t`Must be provided`;
      },
      email: (v: string) => {
        if (!v) return t`Must be provided`;
      },
      plainPassword: (v: string) => {
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
    await auth
      .signUpWithEmailPassword({
        ...values,
        plainPassword: values.plainPassword,
      })
      .catch((error) => onFormError(form, error));
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label={t`Name`}
          autoFocus
          size="md"
          leftSection={<IconUser strokeWidth={1.5} size={18} />}
          placeholder={t`Enter your name`}
          {...form.getInputProps("name")}
        />

        <TextInput
          label={t`Email`}
          size="md"
          leftSection={<IconMail strokeWidth={1.5} size={18} />}
          placeholder="example@gmail.com"
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label={t`Password`}
          size="md"
          placeholder={t`Password must contain at least ${6} characters`}
          leftSection={<IconLock strokeWidth={1.5} size={18} />}
          {...form.getInputProps("plainPassword")}
        />

        <Button mt="md" loading={isSubmitting} type="submit">
          <Trans>Register</Trans>
        </Button>
      </Stack>
    </form>
  );
};
