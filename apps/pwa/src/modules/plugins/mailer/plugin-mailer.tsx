"use client";

import { MailerIllustration } from "@/components/illustrations/mailer";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { Anchor, Button, Stack, Text, Title, em } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { FC, useState } from "react";
import { PluginMailerForm } from "./plugin-mailer-form";
import { Trans } from "@lingui/react/macro";

export const PluginMailer: FC = () => {
  const { workspaceSetting } = useWorkspaceSetting();

  const color = useColor();
  const [isShowForm, setIsShowForm] = useState(false);

  if (isShowForm) return <PluginMailerForm onDone={() => setIsShowForm(false)} />;

  if (workspaceSetting?.mailer)
    return (
      <Stack align="center">
        <MailerIllustration width={200} />

        <Stack gap={8}>
          <Title ta="center" order={2} fw={300} c={color("primary")}>
            <Trans>Email Account Registered</Trans>
          </Title>
          <Text ta="center">
            <Trans>
              The system is using email <strong>{workspaceSetting.mailer.user}</strong> to send mail
              to customers or system notifications to members.
            </Trans>
          </Text>
        </Stack>

        <Anchor c="gray" mt={10} fw={300} fz={em(14)} onClick={() => setIsShowForm(true)}>
          <Trans>Use another account</Trans>
        </Anchor>
      </Stack>
    );

  return (
    <Stack align="center" py={20}>
      <MailerIllustration width={200} />

      <Stack gap={8}>
        <Title ta="center" order={2} fw={300} c={color("primary")}>
          <Trans>Customize Mail Account</Trans>
        </Title>

        <Text ta="center">
          <Trans>Set up a custom mail account to help customers easily recognize your brand.</Trans>
        </Text>
      </Stack>

      <Button
        mt={10}
        type="submit"
        onClick={() => setIsShowForm(true)}
        rightSection={<IconArrowRight strokeWidth={1.5} />}
      >
        <Trans>Get Started</Trans>
      </Button>
    </Stack>
  );
};
