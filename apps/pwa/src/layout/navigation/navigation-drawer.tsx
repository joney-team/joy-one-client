"use client";

import { Renderer } from "@/components/renderer";
import { OnModalWorkspaceInviteMember } from "@/modules/workspace-members/workspace-invite-member";
import { t } from "@/modules/lang/lang-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  ActionIcon,
  Divider,
  Drawer,
  em,
  Group,
  GroupProps,
  MantineStyleProp,
  rem,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useElementSize, useHover } from "@mantine/hooks";
import {
  IconBuildingSkyscraper,
  IconLayout,
  IconLayoutSidebarLeftCollapse,
  IconOctahedronPlus,
  IconPlus,
  IconPuzzle,
  IconSettings,
  IconUsers,
  IconUsersPlus,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { Avatar } from "../../components/avatar";
import { workspaceLayoutConfig, useWorkspaceLayout } from "../hooks/use-workspace-layout";
import { isExtendedApp } from "@/service";

interface WorkspaceNavigationDrawerProps {
  style?: MantineStyleProp;
  targetProps?: GroupProps;
}

export const WorkspaceNavigationDrawer: FC<WorkspaceNavigationDrawerProps> = (props) => {
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();

  const [opened, { open, close }] = useDisclosure(false);
  const contentSize = useElementSize();

  const NavigationItem: FC<{
    leftSection?: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
  }> = (props) => {
    const hover = useHover();

    const onClick = () => {
      props.onClick?.();
      close();
    };

    const render = (node: React.ReactNode) => {
      if (props.href) {
        return (
          <Link href={props.href} style={{ textDecoration: "none" }} onClick={onClick}>
            {node}
          </Link>
        );
      }

      return node;
    };

    return render(
      <Group
        ref={hover.ref}
        gap={10}
        px={8}
        py={6}
        bg={hover.hovered ? "var(--mantine-color-default-hover)" : "transparent"}
        onClick={onClick}
        style={{
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        {props.leftSection}

        <Text fz={14} c="var(--mantine-color-text)" fw={500}>
          {t(props.label)}
        </Text>
      </Group>
    );
  };

  return (
    <>
      <Group
        px={10}
        gap={10}
        justify={workspaceLayout.isNavbarCollapsed ? "center" : "space-between"}
        wrap="nowrap"
        {...props.targetProps}
        style={{ ...props.targetProps?.style, cursor: "pointer", userSelect: "none" }}
        onClick={open}
      >
        <Avatar workspace={workspace.userMember.workspace} size={30} bg="var(--mantine-color-body)" radius={5} />

        <Renderer visible={!workspaceLayout.isNavbarCollapsed}>
          <Stack gap={0} flex={1} ref={contentSize.ref}>
            <Text fz={rem(14)} fw={600} truncate="end" maw={contentSize.width}>
              {workspace.userMember.workspace.name}
            </Text>
          </Stack>

          <ActionIcon
            variant="subtle"
            color="var(--mantine-color-dimmed)"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              workspaceLayout.setNavigationWidth(workspaceLayoutConfig.defaultNavigationCollapsedWidth);
            }}
          >
            <IconLayoutSidebarLeftCollapse strokeWidth={1.6} size={20} />
          </ActionIcon>
        </Renderer>
      </Group>

      <Drawer
        opened={opened}
        onClose={close}
        position="left"
        withCloseButton={false}
        size={260}
        p={0}
        styles={{
          body: {
            padding: 8,
          },
        }}
      >
        <Stack gap={0} w="100%">
          <Group gap={10} align="start" wrap="nowrap" w="100%">
            <Avatar
              mt={3}
              workspace={workspace.userMember.workspace}
              size={45}
              bg="var(--mantine-color-body)"
              radius={5}
            />

            <Group flex={1} justify="space-between" wrap="nowrap" gap={2} align="start">
              <Stack gap={5} w="100%">
                <Text fz={rem(18)} fw={600}>
                  {workspace.userMember.workspace.name}
                </Text>
                {workspace.workspaceSubscription && (
                  <Text fz={rem(12)}>• {workspace.workspaceSubscription.subscription.name}</Text>
                )}
              </Stack>

              <ActionIcon variant="subtle" color="var(--mantine-color-dimmed)" onClick={close}>
                <IconX size={16} strokeWidth={1.6} />
              </ActionIcon>
            </Group>
          </Group>

          <Divider my={16} opacity={0.5} />

          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavigationItem
              href="/workspace-settings"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconSettings size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label="workspace-settings"
            />

            <NavigationItem
              href="/WorkspaceSettings/modules"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconLayout size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label="modules"
            />

            <NavigationItem
              href="/WorkspaceSettings/plugins"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconPuzzle size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label="plugins"
            />

            <NavigationItem
              href="/WorkspaceSettings/app"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconWorld size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label="custom_domain"
            />

            <Renderer visible={!isExtendedApp()}>
              <NavigationItem
                href="/workspace-billings"
                leftSection={
                  <ThemeIcon variant="subtle" color="dark">
                    <IconOctahedronPlus size={em(22)} strokeWidth={1.6} />
                  </ThemeIcon>
                }
                label="workspace-subscriptions"
              />
            </Renderer>
          </Renderer>

          <Renderer visible={!workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}>
            <NavigationItem
              href={`/members`}
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconUsers size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label="members"
            />
          </Renderer>

          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}>
            <Divider my={16} opacity={0.5} />

            <Label>{t("members")}</Label>

            <NavigationItem
              href={`/members`}
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconUsers size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label="members"
            />

            <NavigationItem
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconUsersPlus size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              onClick={() => OnModalWorkspaceInviteMember()}
              label="invite_members"
            />
          </Renderer>

          <Renderer
            visible={
              !workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS) &&
              workspace.userMember.workspaceBranches.length > 0
            }
          >
            <Divider my={16} opacity={0.5} />

            <Label>{t("branches")}</Label>

            {workspace.userMember.workspaceBranches.map((branch) => {
              return (
                <NavigationItem
                  key={branch._id}
                  leftSection={
                    <ThemeIcon variant="subtle" color="dark">
                      <IconBuildingSkyscraper size={em(22)} strokeWidth={1.6} />
                    </ThemeIcon>
                  }
                  label={branch.name}
                />
              );
            })}
          </Renderer>

          <Renderer visible={!isExtendedApp()}>
            <Divider my={16} opacity={0.5} />
            <Label>{t("switch_workspace")}</Label>

            {workspace.userMembers
              .filter((userMember) => userMember.workspace._id !== workspace.userMember.workspaceId)
              .map((userMember) => {
                if (!userMember.workspaceId) return null;

                return (
                  <NavigationItem
                    key={userMember.workspaceId}
                    leftSection={
                      <ThemeIcon variant="subtle" color="dark">
                        <Avatar workspace={userMember.workspace} size={25} radius={5} bg="var(--mantine-color-body)" />
                      </ThemeIcon>
                    }
                    onClick={() => workspace.select(userMember.workspaceId!)}
                    label={userMember.workspace!.name}
                  />
                );
              })}

            <NavigationItem
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconPlus size={20} strokeWidth={1.6} />
                </ThemeIcon>
              }
              onClick={() => {
                workspace.setIsCreateNew(true);
                workspace.leave();
              }}
              label="create_new_workspace"
            />
          </Renderer>
        </Stack>
      </Drawer>
    </>
  );
};

const Label: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Text fz={rem(12)} c="gray.6" fw={500} mb={5} pl={5}>
      {children}
    </Text>
  );
};
