"use client";

import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { OnModalWorkspaceInviteMember } from "@/modules/workspace-members/workspace-invite-member";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { isExtendedApp } from "@/service";
import { Trans } from "@lingui/react/macro";
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
  IconPlus,
  IconPuzzle,
  IconSettings,
  IconUsers,
  IconUsersPlus,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { FC, Fragment, ReactNode, useMemo } from "react";
import { Avatar } from "../../components/avatar";
import { useWorkspaceLayout } from "../hooks/use-workspace-layout";

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
    leftSection?: ReactNode;
    label: ReactNode;
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
          {props.label}
        </Text>
      </Group>
    );
  };

  const otherWorkspace = useMemo(() => {
    return workspace.userMembers.filter(
      (userMember) => userMember.workspace._id !== workspace.member.workspaceId
    );
  }, [workspace.userMembers, workspace.member]);

  return (
    <Fragment>
      <Group
        px={10}
        gap={10}
        justify={workspaceLayout.isNavbarCollapsed ? "center" : "space-between"}
        wrap="nowrap"
        {...props.targetProps}
        style={{
          ...props.targetProps?.style,
          cursor: "pointer",
          userSelect: "none",
          overflow: "hidden",
        }}
        onClick={open}
      >
        <Avatar
          workspace={workspace.member.workspace}
          size={30}
          bg="var(--mantine-color-body)"
          radius={5}
        />

        <Renderer visible={!workspaceLayout.isNavbarCollapsed}>
          <Stack gap={0} flex={1} ref={contentSize.ref}>
            <Text fz={rem(14)} fw={600} truncate="end" maw={contentSize.width}>
              {workspace.member.workspace.name}
            </Text>
          </Stack>
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
              workspace={workspace.member.workspace}
              size={45}
              radius={5}
              bg="var(--mantine-color-body)"
            />

            <Group flex={1} justify="space-between" wrap="nowrap" gap={2} align="start">
              <Stack gap={0} w="100%">
                <Text fz={rem(18)} fw={600}>
                  {workspace.member.workspace.name}
                </Text>
                <Text fz={rem(12)}>Workspace</Text>
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
              label={<Trans>Workspace settings</Trans>}
            />

            <NavigationItem
              href="/workspace-settings/modules"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconLayout size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label={<Trans>Modules</Trans>}
            />

            <NavigationItem
              href="/workspace-settings/plugins"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconPuzzle size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label={<Trans>Plugins</Trans>}
            />

            <NavigationItem
              href="/workspace-settings/app"
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconWorld size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label={<Trans>Custom domain</Trans>}
            />
          </Renderer>

          <Renderer
            visible={!workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}
          >
            <NavigationItem
              href={`/members`}
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconUsers size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label={<Trans>Members</Trans>}
            />
          </Renderer>

          <Renderer
            visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}
          >
            <Divider my={16} opacity={0.5} />

            <Label>
              <Trans>Members</Trans>
            </Label>

            <NavigationItem
              href={`/members`}
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconUsers size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              label={<Trans>Members</Trans>}
            />

            <NavigationItem
              leftSection={
                <ThemeIcon variant="subtle" color="dark">
                  <IconUsersPlus size={em(22)} strokeWidth={1.6} />
                </ThemeIcon>
              }
              onClick={() => OnModalWorkspaceInviteMember()}
              label={<Trans>Invite members</Trans>}
            />
          </Renderer>

          <Renderer
            visible={
              !workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS) &&
              workspace.member.workspaceBranches.length > 0
            }
          >
            <Divider my={16} opacity={0.5} />

            <Label>
              <Trans>Branches</Trans>
            </Label>

            {workspace.member.workspaceBranches.map((branch) => {
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
            <Label>
              <Trans>Switch workspace</Trans>
            </Label>

            {otherWorkspace.map((member) => {
              return (
                <NavigationItem
                  key={member.workspaceId}
                  leftSection={
                    <ThemeIcon variant="subtle" color="dark">
                      <Avatar
                        workspace={member.workspace}
                        size={25}
                        radius={5}
                        bg="var(--mantine-color-body)"
                      />
                    </ThemeIcon>
                  }
                  onClick={() => workspace.select(member.workspaceId)}
                  label={member.workspace.name}
                />
              );
            })}

            <Group py="xs">
              <Button
                leftIcon={IconPlus}
                size="compact-xs"
                color="gray"
                variant="light"
                styles={{
                  inner: {
                    justifyContent: "flex-start",
                  },
                }}
                onClick={() => {
                  workspace.setIsCreateNew(true);
                  workspace.leave();
                }}
              >
                <Trans>Create new workspace</Trans>
              </Button>
            </Group>
          </Renderer>
        </Stack>
      </Drawer>
    </Fragment>
  );
};

const Label: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Text fz={rem(12)} c="gray.6" fw={500} mb={5} pl={5}>
      {children}
    </Text>
  );
};
