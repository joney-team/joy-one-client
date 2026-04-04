"use client";

import { Button } from "@/components/buttons/button";
import { UpdateUserPasswordInput } from "@/graphql/types.graphql";
import { useFormSubmit } from "@/hooks/use-form";
import { useAuth } from "@/modules/auth/auth-context";
import { onSuccess } from "@/utils/actions";
import { onFormErrorBinding } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Card, Group, PasswordInput, SimpleGrid, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock } from "@tabler/icons-react";
import { FC } from "react";
import UpdateUserPasswordDocument from "../graphql/updateUserPassword.graphql";

export const UpdatePassword: FC = () => {
  const auth = useAuth();
  const client = useApolloClient();
  const { t } = useLingui();

  const form = useForm<UpdateUserPasswordInput & { confirmPassword: string }>({
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
      client
        .mutate({ mutation: UpdateUserPasswordDocument, variables: { input: values } })
        .catch(onFormErrorBinding(form)),
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
            label={<Trans>Current password</Trans>}
            placeholder={t`Enter your current password`}
            {...form.getInputProps("password")}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
          />
        )}

        <SimpleGrid cols={{ md: 2 }}>
          <PasswordInput
            label={
              auth.user.isPasswordProvided ? <Trans>New password</Trans> : <Trans>Password</Trans>
            }
            placeholder={t`Password must contain at least ${6} characters`}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
            {...form.getInputProps("plainPassword")}
          />

          <PasswordInput
            label={<Trans>Confirm password</Trans>}
            placeholder={t`Enter your confirm password`}
            leftSection={<IconLock strokeWidth={1.5} size={18} />}
            {...form.getInputProps("confirmPassword")}
          />
        </SimpleGrid>

        <Group justify="center" mt={10}>
          <Button onClick={() => submitting.handle()} disabled={!form.isDirty()}>
            <Trans>Update</Trans>
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
