"use client";

import { useApp } from "@/app.context";
import { Avatar } from "@/components/avatar";
import { Image } from "@/components/image";
import { Renderer } from "@/components/renderer";
import { useAuth } from "@/modules/auth/auth-context";
import { useLang } from "@/modules/lang/lang-context";
import { OnModalLang } from "@/modules/lang/modal-language";
import { getWorkspaceMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, em, Group, Menu, Stack, Text } from "@mantine/core";
import {
  IconBell,
  IconChevronDown,
  IconLogout2,
  IconSettings,
  IconShieldLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";

export const WorkspaceHeaderAccount: FC = () => {
  const auth = useAuth();
  const workspace = useWorkspace();
  const lang = useLang();
  const app = useApp();

  return (
    <Menu>
      <Menu.Target>
        <Group gap={8} style={{ cursor: "pointer" }}>
          <Group gap={8} className="unselectable">
            <Avatar user={workspace.userMember} size={em(30)} />

            <Renderer views={["desktop", "tablet"]}>
              <Stack gap={0}>
                <Text fz={em(14)} fw={500}>
                  {workspace.userMember.name}
                </Text>
                <Text maw={120} truncate="end" fz={em(9)} mt={-3} fw={600} c="gray">
                  {getWorkspaceMemberRoleLabel(workspace.userMember)}
                </Text>
              </Stack>
            </Renderer>
          </Group>

          <Renderer views={["desktop", "tablet"]}>
            <ActionIcon size="xs" variant="subtle" color="dark">
              <IconChevronDown strokeWidth={1.2} />
            </ActionIcon>
          </Renderer>
        </Group>
      </Menu.Target>

      <Menu.Dropdown miw={200} className="shadow">
        <Menu.Label>
          <Trans>Profile</Trans>
        </Menu.Label>

        <Menu.Item
          component={Link}
          href="/profile/settings"
          leftSection={<IconSettings size={20} strokeWidth={1.6} />}
        >
          <Trans>Profile settings</Trans>
        </Menu.Item>

        <Menu.Item
          component={Link}
          href="/profile/secure"
          leftSection={<IconShieldLock size={20} strokeWidth={1.6} />}
        >
          <Trans>Secure</Trans>
        </Menu.Item>

        <Menu.Label>
          <Trans>Settings</Trans>
        </Menu.Label>

        <Menu.Item
          component={Link}
          href="/profile/notifications"
          leftSection={<IconBell size={20} strokeWidth={1.6} />}
        >
          <Trans>Notifications</Trans>
        </Menu.Item>

        <Menu.Item
          leftSection={<Image src={`/lang/${lang.locale}.png`} w={18} />}
          onClick={() => OnModalLang()}
        >
          <Trans>Language</Trans>
        </Menu.Item>

        <Menu.Label>
          <Trans>Version {app.config.version}</Trans>
        </Menu.Label>

        <Menu.Item
          leftSection={<IconLogout2 size={20} strokeWidth={1.6} />}
          onClick={() => auth.signOut()}
          c="gray.6"
          fz={13}
        >
          <Trans>Logout</Trans>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
