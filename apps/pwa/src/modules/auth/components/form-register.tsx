"use client";

import { Button } from "@/components/buttons/button";
import { useAuth } from "@/modules/auth/auth-context";
import { onFormErrorLegacy } from "@/utils/exceptions.utils";
import { PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { tl } from "@/modules/lang/lang-service";

export const FormRegister: FC = () => {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      plainPassword: "",
    },
    validate: {
      name: (v: string) => {
        if (!v) return tl("must_be_provided");
      },
      email: (v: string) => {
        if (!v) return tl("must_be_provided");
      },
      plainPassword: (v: string) => {
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
    await auth
      .registerWithEmailAndPassword({
        ...values,
        plainPassword: values.plainPassword,
      })
      .catch(onFormErrorLegacy(form));
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label={tl("name")}
          autoFocus
          size="md"
          leftSection={<IconUser strokeWidth={1.5} size={18} />}
          placeholder="Jason Tran"
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Email"
          size="md"
          leftSection={<IconMail strokeWidth={1.5} size={18} />}
          placeholder="example@gmail.com"
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label={tl("password")}
          size="md"
          placeholder={tl("password_length", { length: 6 }) as string}
          leftSection={<IconLock strokeWidth={1.5} size={18} />}
          {...form.getInputProps("plainPassword")}
        />

        <Button mt={16} loading={isSubmitting} type="submit" h={42}>
          {tl("register")}
        </Button>
      </Stack>
    </form>
  );
};
