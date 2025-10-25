"use client";

import { Button } from "@/components/buttons/button";
import { api } from "@/modules/apis";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  em,
  Group,
  PasswordInput,
  Stack,
  Stepper,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconCircleCheck, IconSend } from "@tabler/icons-react";
import { FC, useState } from "react";

interface MailerFormProps {
  onDone?: () => void;
}

export const PluginMailerForm: FC<MailerFormProps> = (props) => {
  const workspace = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [active, setActive] = useState(0);

  const form = useForm({
    initialValues: {
      user: "",
      pass: "",
      testEmail: "",
    },
    validate: {
      user: (value: string) => {
        if (!value) return t`Must be provided`;
      },
      pass: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (payload) => {
    if (active === 0) {
      setActive(1);
    }

    if (active === 1) {
      if (!payload.testEmail) form.setFieldError("testEmail", t`Please enter the email to receive`);
      else {
        setIsSubmitting(true);
        try {
          await api.post("/plugins/mailer/workspace/test", {
            to: payload.testEmail,
            accountUser: payload.user,
            accountPass: payload.pass,
          });
          setActive(2);
        } catch (error) {
          onError(error);
        }
        setIsSubmitting(false);
      }
    }

    if (active === 2) {
      setIsSubmitting(true);
      try {
        await setWorkspaceSettings({ ...workspace.settings, mailer: payload });
        props.onDone?.();
      } catch (error) {
        onError(error);
      }
      setIsSubmitting(false);
    }
  });

  return (
    <Stepper active={active} onStepClick={setActive} size="xs">
      <Stepper.Step label={t`Gmail account`}>
        <Card shadow="none" withBorder bg="var(--mantine-color-body)">
          <Stack>
            <TextInput label={t`Gmail address`} {...form.getInputProps("user")} />

            <PasswordInput label={t`Application password`} {...form.getInputProps("pass")} />

            <Button type="submit" loading={isSubmitting} onClick={onSubmit}>
              <Trans>Continue</Trans>
            </Button>

            <Anchor ta="center" c="gray" mt={5} fw={300} fz={em(14)} onClick={props.onDone}>
              <Trans>Use default mail</Trans>
            </Anchor>
          </Stack>
        </Card>
      </Stepper.Step>
      <Stepper.Step label={t`Send test email`}>
        <Card shadow="none" withBorder bg="var(--mantine-color-body)">
          <Stack>
            <TextInput label={t`Email to receive`} {...form.getInputProps("testEmail")} />

            {isSubmitting && (
              <Text ta="center" fw={300} fz={em(14)}>
                <Trans>
                  You please be patient and wait <br /> it may take 1 - 2 minutes to send the test
                  email.
                </Trans>
              </Text>
            )}

            <Group wrap="nowrap">
              <Button
                type="submit"
                variant="light"
                color="gray"
                onClick={() => setActive(0)}
                leftSection={<IconArrowLeft strokeWidth={1.5} />}
                fullWidth
              >
                <Trans>Back</Trans>
              </Button>

              <Button
                type="submit"
                loading={isSubmitting}
                onClick={onSubmit}
                fullWidth
                rightSection={<IconSend strokeWidth={1.5} />}
              >
                <Trans>Send test</Trans>
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stepper.Step>
      <Stepper.Step label={t`Complete`}>
        <Card shadow="none" withBorder bg="var(--mantine-color-body)" pb={20}>
          <Stack align="center">
            <ThemeIcon variant="transparent" size="xl">
              <IconCircleCheck strokeWidth={1.2} size={150} />
            </ThemeIcon>

            <Title mt={-10} ta="center" order={2} fw={300} c="primary">
              <Trans>Test email sent successfully!</Trans>
            </Title>

            <Text ta="center">
              <Trans>
                After confirming the system will use the email address{" "}
                <strong>{form.values.user}</strong> to send Mail to customers <br /> or system
                notifications to members.
              </Trans>
            </Text>

            <Button mt={10} type="submit" loading={isSubmitting} onClick={onSubmit}>
              <Trans>Confirm and apply</Trans>
            </Button>

            <Anchor c="gray" mt={10} fw={300} fz={em(14)} onClick={() => setActive(0)}>
              <Trans>Use another account</Trans>
            </Anchor>
          </Stack>
        </Card>
      </Stepper.Step>
    </Stepper>
  );
};
