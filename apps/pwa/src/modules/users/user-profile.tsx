"use client";

import { useApp } from "@/app.context";
import { useColor } from "@/modules/theme/use-color";
import { Avatar } from "@/components/avatar";
import { ColorSchemes } from "@/components/color-schemes";
import { Container } from "@/components/container";
import { Button } from "@/components/buttons/button";
import { ButtonHrmTimeKeeping } from "@/components/buttons/button-hrm-timekeepings";
import { ButtonLanguage } from "@/components/buttons/button-language";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { OnModalWorkspaceSubscription } from "@/modules/workspace-subscriptions/modal-workspace-subscriptions";
import { useAuth } from "@/modules/auth/auth-context";
import { num, t } from "@/modules/lang/lang-service";
import { renderLocation } from "@/modules/locations/locations-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderSubscriptionNum } from "@/modules/workspace-subscriptions/workspace-subscriptions-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { formatBytes } from "@/utils/file.utils";
import {
  ActionIcon,
  Anchor,
  Card,
  Divider,
  Group,
  Space,
  Stack,
  Text,
  ThemeIcon,
  em,
  rem,
} from "@mantine/core";
import {
  Icon,
  IconArrowsExchange,
  IconChevronRight,
  IconClockCheck,
  IconConfetti,
  IconLayout,
  IconLogout,
  IconNotification,
  IconPencil,
  IconPuzzle,
  IconReportMoney,
  IconSettings,
  IconShieldLock,
  IconSignRight,
  IconVersions,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FC, Fragment, useEffect } from "react";

export const Profile: FC = () => {
  const auth = useAuth();
  const app = useApp();
  const workspace = useWorkspace();
  const router = useRouter();
  const color = useColor();
  const layout = useLayout();

  useEffect(() => {
    layout.setComponents({
      head: t("profile"),
    });
  }, []);

  return (
    <Container p={16}>
      <Stack>
        <Group justify="space-between" style={{ cursor: "pointer" }}>
          <Group gap={10} onClick={() => router.push(`/profile/information`)}>
            <Avatar user={workspace.userMember} size={40} hideOnlineStatus />

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
              name={t("hrm_timekeepings_history")}
              href="/workspace/hrm/user-timekeepings"
            />
          )}
          <NavItem
            icon={IconNotification}
            name={t("notifications")}
            href="/profile/notifications"
          />
          <NavItem icon={IconShieldLock} name={t("secure")} href="/profile/secure" />
        </Stack>

        <Space />

        <Divider label="Workspace" labelPosition="left" />

        <Group justify="space-between">
          <Group
            align={workspace.userMember.workspace.location ? "start" : "center"}
            wrap="nowrap"
            gap={10}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/workspace`)}
          >
            <Avatar
              workspace={workspace.userMember.workspace}
              size={40}
              hideOnlineStatus
              bg="var(--mantine-color-body)"
            />

            <Stack gap={3} mt={-3}>
              <Text fz={rem(15)} fw={700}>
                {workspace.userMember.workspace.name}
              </Text>
              {workspace.userMember.workspace.location && (
                <Text fz={em(13)} fw={400}>
                  {renderLocation(workspace.userMember.workspace.location)}
                </Text>
              )}
            </Stack>
          </Group>
        </Group>

        <Stack gap={10}>
          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavItem icon={IconSettings} name={t("settings")} href="/workspace-settings" />
          </Renderer>

          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavItem icon={IconLayout} name={t("modules")} href="/WorkspaceSettings/modules" />
          </Renderer>

          <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
            <NavItem icon={IconPuzzle} name={t("plugins")} href="/workspace-settings/plugins" />
          </Renderer>

          <Renderer
            visible={
              !!workspace.workspaceSubscription &&
              !workspace.workspaceSubscription.fixedSubscriptionId &&
              workspace.hasPermission(WorkspacePermission.WORKSPACE_BILLINGS_MANAGER)
            }
          >
            <NavItem
              icon={IconReportMoney}
              name={t("workspace-subscriptions")}
              href="/workspace-billings"
            />
          </Renderer>
        </Stack>

        {workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) &&
          !!workspace.workspaceSubscription && (
            <Card withBorder>
              <Stack>
                <Group gap={8} align="center" justify="space-between">
                  <Group gap={10} align="center">
                    <Text
                      size="lg"
                      c={workspace.workspaceSubscription.subscription.color}
                      variant={
                        workspace.workspaceSubscription.subscription.isDefault
                          ? "outline"
                          : "filled"
                      }
                      fw={600}
                    >
                      {workspace.workspaceSubscription.subscription.name}
                    </Text>

                    {!workspace.workspaceSubscription.fixedSubscriptionId &&
                      !workspace.workspaceSubscription.subscription.isDefault &&
                      workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
                        <Anchor c="gray" onClick={() => OnModalWorkspaceSubscription()} fz={em(12)}>
                          <Group gap={3}>
                            <IconArrowsExchange strokeWidth={1.5} size={16} />
                            {t("change-subscriptions")}
                          </Group>
                        </Anchor>
                      )}
                  </Group>

                  {!workspace.workspaceSubscription.fixedSubscriptionId &&
                    workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS) && (
                      <Fragment>
                        {(function () {
                          if (workspace.workspaceSubscription.subscription.isDefault) {
                            return (
                              <Button
                                radius={100}
                                color="yellow"
                                leftSection={<IconConfetti size={18} />}
                                onClick={() => OnModalWorkspaceSubscription()}
                              >
                                {t("upgrade-subscriptions")}
                              </Button>
                            );
                          }

                          return (
                            <Anchor
                              fw={500}
                              fz={em(13)}
                              c={color(workspace.balance.balance > 0 ? "primary" : "gray")}
                              onClick={() => router.push(`/workspace-billings`)}
                            >
                              {t("balance")}: {num(workspace.balance.balance, { type: "money" })}
                            </Anchor>
                          );
                        })()}
                      </Fragment>
                    )}
                </Group>

                <Group justify="space-between">
                  <Text fz={em(13)}>{t("members")}</Text>
                  <Text fz={em(13)} ta="right" fw={500}>
                    {num(workspace.workspaceSubscription.stat.totalMembers)} /{" "}
                    {renderSubscriptionNum(
                      workspace.workspaceSubscription.subscription.limitMembers
                    )}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text fz={em(13)}>{t("storage")}</Text>
                  <Text fz={em(13)} ta="right" fw={500}>
                    {formatBytes(workspace.workspaceSubscription.stat.storage)} /{" "}
                    {renderSubscriptionNum(
                      workspace.workspaceSubscription.subscription.limitStorage,
                      formatBytes
                    )}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text fz={em(13)}>{t("social-connections")} (Fanpage / Zalo OAs)</Text>
                  <Text fz={em(13)} ta="right" fw={500}>
                    {num(
                      workspace.workspaceSubscription.stat.totalMetaPages +
                        workspace.workspaceSubscription.stat.totalZaloOAs
                    )}{" "}
                    /{" "}
                    {renderSubscriptionNum(
                      workspace.workspaceSubscription.subscription.limitSocialConnections
                    )}
                  </Text>
                </Group>
              </Stack>
            </Card>
          )}

        <Group mt={10} justify="center" align="center">
          {workspace.userMembers.length > 1 && !app.metadata.isExtended && (
            <Button
              size="compact-xs"
              h={28}
              variant="light"
              rightSection={
                <IconSignRight strokeWidth={1.5} size={18} style={{ marginLeft: -3 }} />
              }
              color="gray"
              fw={400}
              fz={em(14)}
              onClick={() => workspace.leave()}
            >
              {t("switch")} workspace
            </Button>
          )}

          <Button
            size="compact-xs"
            h={28}
            variant="light"
            rightSection={<IconLogout strokeWidth={1.5} size={18} style={{ marginLeft: -3 }} />}
            color="gray"
            fw={400}
            fz={em(14)}
            onClick={auth.signOut}
          >
            {t("sign_out")}
          </Button>
        </Group>

        <Stack justify="center" align="center" mt={10} mb={50}>
          <ButtonLanguage />

          <Group gap={0}>
            <ThemeIcon variant="transparent" color="gray">
              <IconVersions size={20} strokeWidth={1.5} />
            </ThemeIcon>
            <Text ta="center" fz={rem(13)} c="gray">
              {t("version")} {app.config.version}
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
