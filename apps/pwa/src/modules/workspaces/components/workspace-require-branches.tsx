"use client";

import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { isExtendedApp } from "@/service";
import { Trans } from "@lingui/react/macro";
import { Anchor, Stack, Text, Title } from "@mantine/core";
import { FC } from "react";
import { GoWorkIllustration } from "../../../components/illustrations/go-work";
import { useWorkspace } from "../workspace-context";

export const WorkspaceRequireBranches: FC = () => {
  const workspace = useWorkspace();
  const auth = useAuth();
  const color = useColor();

  const onLeave = () => {
    if (isExtendedApp()) {
      auth.signOut();
    } else {
      workspace.leave();
    }
  };

  return (
    <Stack gap={30} align="center" justify="center" mih="100dvh">
      <GoWorkIllustration width={150} />
      <Stack gap={10}>
        <Title c={color("primary")} order={4} ta="center">
          <Trans>Assigning a working branch</Trans>
        </Title>
        <Text c="gray" fz={16} ta="center">
          <Trans>You did a great job. Please relax and wait a moment!</Trans>
        </Text>
      </Stack>

      <Anchor ta="center" onClick={onLeave} fz={12} c="gray">
        <Trans>Leave</Trans>
      </Anchor>
    </Stack>
  );
};
