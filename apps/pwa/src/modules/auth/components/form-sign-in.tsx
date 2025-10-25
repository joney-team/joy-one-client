"use client";

import { Button } from "@/components/buttons/button";
import { useAuth } from "@/modules/auth/auth-context";
import { onFormErrorLegacy } from "@/utils/exceptions.utils";
import { Anchor, em, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconMail } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { tl } from "@/modules/lang/lang-service";

export const FormSignIn: FC<{ onForgotPassword: () => void }> = (props) => {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      plainPassword: "",
    },
    validate: {
      email: (v: string) => {
        if (!v) return tl("must_be_provided");
      },
      plainPassword: (v: string) => {
        if (!v) return tl("must_be_provided");
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
      .catch(onFormErrorLegacy(form));
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label="Email"
          size="md"
          placeholder={tl("enter_your_email") as string}
          {...form.getInputProps("email")}
          leftSection={<IconMail strokeWidth={1.5} size={18} />}
          autoFocus
        />

        <PasswordInput
          label={tl("password")}
          size="md"
          {...form.getInputProps("plainPassword")}
          placeholder={tl("enter_your_password") as string}
          leftSection={<IconLock strokeWidth={1.5} size={18} />}
        />

        <Button mt={16} loading={isSubmitting} type="submit" h={42}>
          {tl("login")}
        </Button>

        <Anchor onClick={props.onForgotPassword} ta="center" mt={16} fz={em(14)}>
          {tl("forgot_password")}?
        </Anchor>
      </Stack>
    </form>
  );
};
