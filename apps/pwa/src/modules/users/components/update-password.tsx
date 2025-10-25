"use client";

import { Button } from "@/components/buttons/button";
import { useFormSubmit } from "@/hooks/use-form";
import { useAuth } from "@/modules/auth/auth-context";
import { updatePassword } from "@/modules/users/users-service";
import { UpdateUserPasswordDto } from "@/modules/users/users-types";
import { onSuccess } from "@/utils/actions";
import { t } from "@lingui/core/macro";
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
            if (!v) return t`Must be provided`;
          }
        : undefined,
      plainPassword: (v) => {
        if (!v) return t`Must be provided`;
        if (v.length < 6) return t`Password must contain at least ${6} characters`;
      },
      confirmPassword: (v, values) => {
        if (!v) return t`Must be provided`;
        if (v !== values.plainPassword) return t`Password not match`;
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
      onSuccess({ message: t`Password updated` });
      _form.reset();
    },
  });

  return (
    <Card shadow="xs">
      <Stack>
        {auth.user.isPasswordProvided && (
          <PasswordInput
            label={t`Current password`}
            placeholder={t`Enter your current password`}
            {...form.getInputProps("password")}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
          />
        )}

        <SimpleGrid cols={{ md: 2 }}>
          <PasswordInput
            label={auth.user.isPasswordProvided ? t`New password` : t`Password`}
            placeholder={t`Password must contain at least ${6} characters`}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
            {...form.getInputProps("plainPassword")}
          />

          <PasswordInput
            label={t`Confirm password`}
            placeholder={t`Enter your confirm password`}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
            {...form.getInputProps("confirmPassword")}
          />
        </SimpleGrid>

        <Group justify="center" mt={10}>
          <Button onClick={submitting.handle} disabled={!form.isDirty()}>
            {t`Update`}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
