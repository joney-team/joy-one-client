"use client";

import { useApp } from "@/app.context";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ButtonHrmTimeKeeping } from "@/components/buttons/button-hrm-timekeepings";
import { ButtonLanguage } from "@/components/buttons/button-language";
import { ColorSchemes } from "@/components/color-schemes";
import { Container } from "@/components/container";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Divider, Group, Space, Stack, Text, ThemeIcon, em, rem } from "@mantine/core";
import {
  Icon,
  IconChevronRight,
  IconClockCheck,
  IconLayout,
  IconLogout,
  IconNotification,
  IconPencil,
  IconPuzzle,
  IconSettings,
  IconShieldLock,
  IconSignRight,
  IconVersions,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";

export const Profile: FC = () => {
  const auth = useAuth();
  const app = useApp();
  const workspace = useWorkspace();
  const router = useRouter();
  const layout = useLayout();

  useEffect(() => {
    layout.setComponents({
      head: t`Profile`,
    });
  }, []);

  return (
    <Container p={16}>
      <Stack>
        <Group justify="space-between" style={{ cursor: "pointer" }}>
          <Group gap={10} onClick={() => router.push("/profile/settings")}>
            <Avatar user={workspace.member} size={40} hideOnlineStatus />

            <Stack gap={0}>
              <Group gap={3}>
                <Text fz={rem(15)} fw={700}>
                  {auth.user?.name}
                </Text>
                <ActionIcon color="gray" variant="transparent">
                  <IconPencil size={18} />
                </ActionIcon>
              </Group>

              {auth.user?.email && (
                <Text fz={rem(12)} c="gray">
                  {auth.user.email}
                </Text>
              )}
            </Stack>
          </Group>

          <Group>
            <ButtonHrmTimeKeeping />
            <ColorSchemes />
          </Group>
        </Group>

        <Stack gap={10}>
          {workspace.isHrmTimekeepingAvailable && (
            <NavItem
              icon={IconClockCheck}
              name={t`Timekeeping History`}
              href="/workspace/hrm/user-timekeepings"
            />
          )}
          <NavItem icon={IconNotification} name={t`Notifications`} href="/profile/notifications" />
          <NavItem icon={IconShieldLock} name={t`Secure`} href="/profile/secure" />
        </Stack>

        <Space />

        <Divider label="Workspace" labelPosition="left" />

        <Group justify="space-between">
          <Group
            align={workspace.member.workspace.location ? "start" : "center"}
            wrap="nowrap"
            gap={10}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/workspace`)}
          >
            <Avatar
              workspace={workspace.member.workspace}
              size={40}
              hideOnlineStatus
              bg="var(--mantine-color-body)"
            />

            <Stack gap={3} mt={-3}>
              <Text fz={rem(15)} fw={700}>
                {workspace.member.workspace.name}
              </Text>
              {workspace.member.workspace.location && (
                <Text fz={em(13)} fw={400}>
                  {workspace.member.workspace.location?.address}
                </Text>
              )}
            </Stack>
          </Group>
        </Group>

        <Stack gap={10}>
          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavItem icon={IconSettings} name={t`Settings`} href="/workspace-settings" />
          </Renderer>

          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavItem icon={IconLayout} name={t`Modules`} href="/WorkspaceSettings/modules" />
          </Renderer>

          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavItem icon={IconPuzzle} name={t`Plugins`} href="/workspace-settings/plugins" />
          </Renderer>
        </Stack>

        <Group mt={10} justify="center" align="center">
          {workspace.userMembers.length > 1 && !app.metadata.isExtended && (
            <Button
              size="compact-xs"
              h={28}
              variant="light"
              rightIcon={IconSignRight}
              color="gray"
              onClick={() => workspace.leave()}
            >
              <Trans>Switch</Trans> workspace
            </Button>
          )}

          <Button
            size="compact-xs"
            h={28}
            variant="light"
            rightIcon={IconLogout}
            color="gray"
            onClick={auth.signOut}
          >
            <Trans>Sign out</Trans>
          </Button>
        </Group>

        <Stack justify="center" align="center" mt={10} mb={50}>
          <ButtonLanguage />

          <Group gap={0}>
            <ThemeIcon variant="transparent" color="gray">
              <IconVersions size={20} strokeWidth={1.5} />
            </ThemeIcon>
            <Text ta="center" fz={rem(13)} c="gray">
              <Trans>Version {app.config.version}</Trans>
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
};

const NavItem: FC<{
  icon: Icon;
  name: string;
  href: string;
  rightSession?: React.ReactNode;
}> = (props) => {
  const router = useRouter();

  return (
    <Group
      justify="space-between"
      py={10}
      onClick={() => router.push(props.href)}
      style={{ cursor: "pointer" }}
    >
      <Group gap={10}>
        <ThemeIcon variant="transparent" color="dark">
          <props.icon strokeWidth={1.5} size={25} />
        </ThemeIcon>

        <Text>{props.name}</Text>
      </Group>

      <Group justify="end">
        {props.rightSession}
        <ActionIcon color="gray" variant="transparent" mr={-5}>
          <IconChevronRight strokeWidth={1.2} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
