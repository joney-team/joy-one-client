"use client";

import { useFormSubmit } from "@/hooks/use-form";
import { Button } from "@/components/buttons/button";
import { onSuccess } from "@/utils/actions";
import { useAuth } from "@/modules/auth/auth-context";
import { tl } from "@/modules/lang/lang-service";
import { updatePassword } from "@/modules/users/users-service";
import { UpdateUserPasswordDto } from "@/modules/users/users-types";
import { String } from "@/utils/string.utils";
import { Card, Group, PasswordInput, SimpleGrid, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock } from "@tabler/icons-react";
import { FC } from "react";

export const UpdatePassword: FC = () => {
  const auth = useAuth();

  const form = useForm<UpdateUserPasswordDto & { confirmPassword: string }>({
    validate: {
      password: auth.user.isPasswordProvided
        ? (v) => {
            if (!v) return tl("must_be_provided");
          }
        : undefined,
      plainPassword: (v) => {
        if (!v) return tl("must_be_provided");
        if (v.length < 6) return tl("password_length", { length: 6 });
      },
      confirmPassword: (v, values) => {
        if (!v) return tl("must_be_provided");
        if (v !== values.plainPassword) return tl("password_not_match");
      },
    },
  });

  const submitting = useFormSubmit(form, {
    onSubmit: (values) =>
      updatePassword({
        password: values.password,
        plainPassword: values.plainPassword,
      }),
    onSuccess: async (_, _form) => {
      onSuccess({ message: tl("password_updated") });
      _form.reset();
    },
  });

  return (
    <Card shadow="xs">
      <Stack>
        {auth.user.isPasswordProvided && (
          <PasswordInput
            label={tl("current_password")}
            placeholder={String.convertToTitleCase(
              `${tl("enter")} ${tl("current_password")}`.toLowerCase()
            )}
            {...form.getInputProps("password")}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
          />
        )}

        <SimpleGrid cols={{ md: 2 }}>
          <PasswordInput
            label={tl(auth.user.isPasswordProvided ? "new_password" : "password")}
            placeholder={tl("password_length", { length: 6 }) as string}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
            {...form.getInputProps("plainPassword")}
          />

          <PasswordInput
            label={tl("confirm_password")}
            placeholder={String.convertToTitleCase(
              `${tl("enter")} ${tl("confirm_password")}`.toLowerCase()
            )}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
            {...form.getInputProps("confirmPassword")}
          />
        </SimpleGrid>

        <Group justify="center" mt={10}>
          <Button onClick={submitting.handle} disabled={!form.isDirty()}>
            {tl("update")}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
