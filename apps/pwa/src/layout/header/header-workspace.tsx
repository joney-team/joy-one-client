"use client";

import { Account } from "@/components/account";
import { ColorSchemes } from "@/components/color-schemes";
import { Renderer } from "@/components/renderer";
import { configs } from "@/configs/layout.config";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { HrmTimekeepingButton } from "@/modules/hrm-timekeepings/hrm-timekeeping-button";
import { UserNotifications } from "@/modules/notifications/user-notifications";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  Divider,
  Group,
  Kbd,
  Text,
  ThemeIcon,
  rem,
  rgba,
} from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import {
  IconChevronLeft,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSearch,
} from "@tabler/icons-react";
import { FC, memo } from "react";
import { useWorkspaceLayout, workspaceLayoutConfig } from "../hooks/use-workspace-layout";
import { WorkspaceHeaderAccount } from "./header-account";
import { WorkspaceHeaderBreadcrumbs } from "./header-breadcrumbs";
import { WorkspaceHeaderShortcuts } from "./header-shortcuts";
import { WorkspaceHeaderTasksBreadcrumbs } from "./header-tasks-breadcrumbs";

export const HeaderWorkspace: FC = memo(() => {
  const router = useRouter();
  const layout = useLayout();
  const workspace = useWorkspace();
  const colorScheme = useColorScheme();
  const workspaceLayout = useWorkspaceLayout();

  if (!workspace.isAvailable) return null;

  if (layout.view === "mobile") {
    return (
      <Group h="100%" justify="space-between" align="center" gap={8} mx={-5} flex={1} px={16}>
        <Renderer visible={!!!layout.components.head}>
          <WorkspaceHeaderShortcuts />

          <Group
            justify="space-between"
            bg={rgba(configs.backgroundColors[colorScheme], 0.7)}
            gap={10}
            flex={1}
            style={{ borderRadius: 100 }}
            h={34}
            pr={8}
            pl={5}
            onClick={spotlight.open}
            id="search-bar"
          >
            <ActionIcon variant="transparent" color="dark">
              <IconSearch size={20} strokeWidth={1.8} />
            </ActionIcon>

            <Text ta="left" flex={1} fw={300} fz={rem(12)}>
              <Trans>Search</Trans>
            </Text>
          </Group>
        </Renderer>

        {layout.components.head && (
          <Group flex={1} gap={10}>
            <ActionIcon onClick={() => router.back()} variant="subtle" color="dark">
              <IconChevronLeft strokeWidth={1.5} />
            </ActionIcon>

            {typeof layout.components.head === "string" ? (
              <Text fz={16} fw={600} truncate="end" maw="50dvw">
                {layout.components.head}
              </Text>
            ) : (
              layout.components.head
            )}
          </Group>
        )}

        <ActionIcon onClick={spotlight.open} variant="subtle" color="var(--mantine-color-text)">
          <IconSearch size={20} strokeWidth={1.5} />
        </ActionIcon>

        <UserNotifications />
        <Account onlyAvatar />
      </Group>
    );
  }

  return (
    <Group
      justify="space-between"
      align="center"
      gap={8}
      flex={1}
      wrap="nowrap"
      h="100%"
      w="100%"
      px={8}
    >
      <Group gap={5} flex={1} wrap="nowrap">
        <Group gap={5} flex={1} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray.6"
            onClick={() => {
              workspaceLayout.setNavigationWidth(
                workspaceLayout.isNavbarCollapsed
                  ? workspaceLayoutConfig.defaultNavigationExpandedWidth
                  : workspaceLayoutConfig.minNavigationWidth
              );
            }}
          >
            {workspaceLayout.isNavbarCollapsed ? (
              <IconLayoutSidebarLeftExpand strokeWidth={1.5} size={20} />
            ) : (
              <IconLayoutSidebarLeftCollapse strokeWidth={1.5} size={20} />
            )}
          </ActionIcon>

          <WorkspaceHeaderTasksBreadcrumbs />
          <WorkspaceHeaderBreadcrumbs />
        </Group>

        <Group
          wrap="nowrap"
          justify="center"
          gap={5}
          onClick={spotlight.open}
          style={{ cursor: "pointer" }}
          flex={1}
        >
          <Card
            shadow="none"
            bg={rgba(configs.backgroundColors[colorScheme], 0.7)}
            p={0}
            radius={100}
          >
            <Group gap={5} pl={5} align="center">
              <ThemeIcon variant="subtle" color="gray.6">
                <IconSearch size={16} strokeWidth={1.5} />
              </ThemeIcon>

              <Text c="gray.6" fz={13} pr={10}>
                <Trans>Search</Trans>...
              </Text>

              <Group gap={3} opacity={0.5} fz={8} py={5} pr={16}>
                <Kbd size="xs">Ctrl/Cmd</Kbd> + <Kbd size="xs">K</Kbd>
              </Group>
            </Group>
          </Card>
        </Group>

        <Group flex={1} justify="end" gap={8} wrap="nowrap">
          {layout.components.navigation ? (
            layout.components.navigation
          ) : (
            <WorkspaceHeaderShortcuts />
          )}
        </Group>
      </Group>

      <Group justify="end" wrap="nowrap" pr={5} gap={10}>
        <Center ml={5} mr={0}>
          <Divider orientation="vertical" h={20} />
        </Center>

        <ColorSchemes />
        <HrmTimekeepingButton />
        <UserNotifications />
        <WorkspaceHeaderAccount />
      </Group>
    </Group>
  );
});
