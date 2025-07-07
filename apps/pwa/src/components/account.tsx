"use client";

import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group, Stack, Text, em } from "@mantine/core";
import { FC } from "react";
import { Avatar } from "./avatar";

interface AppAccountProps {
  onlyAvatar?: boolean;
}

export const Account: FC<AppAccountProps> = (props) => {
  const router = useRouter();
  const layout = useLayout();
  const workspace = useWorkspace();

  return (
    <Group
      gap={5}
      id="app-account"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/profile`)}
      wrap="nowrap"
    >
      <Avatar
        user={workspace.userMember}
        style={{ cursor: "pointer" }}
        size={layout.view === "mobile" ? 30 : 38}
        hideOnlineStatus
      />

      {!props.onlyAvatar && (
        <Stack gap={0}>
          <Text fz={em(14)} fw={500}>
            {workspace.userMember.name}
          </Text>
          <Text fz={em(8)} fw={500} c="gray">
            {workspace.userMember.email}
          </Text>
        </Stack>
      )}
    </Group>
  );
};
