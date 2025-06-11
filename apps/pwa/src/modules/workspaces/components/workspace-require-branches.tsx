"use client";

import { useCloseAppLoading } from "@/components/app-loading";
import { useAuth } from "@/modules/auth/auth-context";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceContext } from "@/modules/workspaces/workspaces-types";
import { isExtendedApp } from "@/service";
import { Anchor, Stack, Text, Title } from "@mantine/core";
import { FC } from "react";
import { GoWorkIllustration } from "../../../components/illustrations/go-work";

export const WorkspaceRequireBranches: FC<{ workspace: WorkspaceContext }> = (props) => {
  useCloseAppLoading();

  const { workspace } = props;
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
        <Title c={color("primary")} tt="capitalize" order={4} ta="center">
          {t("workspace_waiting_for_assign_branches")}
        </Title>
        <Text c="gray" fz={16} ta="center">
          {t("workspace_waiting_for_assign_branches_desc")}
        </Text>
      </Stack>

      <Anchor ta="center" onClick={onLeave} fz={12} c="gray">
        {t("leave")}
      </Anchor>
    </Stack>
  );
};
