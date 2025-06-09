"use client";

import { useColor } from "@/modules/theme/use-color";
import { useRouter } from "@/hooks/use-router";
import { Avatar } from "@/components/avatar";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { workspaceModules } from "@/modules/workspaces/workspace-modules";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getDefaultWorkspaceView, getNavigationGroups } from "@/modules/workspaces/workspace-view";
import { StringUtils } from "@/utils/string.utils";
import { ActionIcon, Badge, Divider, Drawer, Group, ScrollArea, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { Renderer } from "../../components/renderer";
import { WorkspaceNavigationMenu } from "./navigation-menu";
import { WorkspaceNavigationDrawer } from "./navigation-drawer";
import { useWorkspaceLayout } from "../hooks/use-workspace-layout";

export const AppNavigation: FC = () => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const router = useRouter();
  const color = useColor();

  const mobileDrawer = useDisclosure(false);

  const components = (workspace.view.menu ?? getDefaultWorkspaceView(workspace.type).menu ?? []).filter((v) => {
    if (v.type === "MODULE") return workspace.isModuleActive(v.moduleId as keyof typeof workspaceModules);
    return true;
  });

  if (!workspace.isAvailable) return null;

  if (layout.view === "mobile") {
    if (layout.components.navigation)
      return (
        <Group p={8} wrap="nowrap" gap={8} justify="center">
          {layout.components.navigation}
        </Group>
      );

    const maxModules = 4;
    const mainCpns = components.filter((v) => v.type === "MODULE").slice(0, maxModules);
    const navigationGroup = getNavigationGroups(
      components.filter((v) => !mainCpns.some((m) => m.id === v.id)),
      workspace.availableModules
    );

    return (
      <Group
        justify="space-around"
        wrap="nowrap"
        style={{ width: "100%", height: workspaceLayout.navigationHeight }}
        gap={0}
      >
        {mainCpns.map((v) => {
          const mo = workspace.modules.find((m) => m.id === v.moduleId);
          if (!mo) return null;

          return (
            <WorkspaceNavigationMenu
              key={v.id}
              icon={mo.icon}
              route={mo.href}
              label={t(mo.name)}
              exact={mo.href === "/"}
            />
          );
        })}

        <Renderer visible={navigationGroup.length > 0}>
          <Group justify="center" align="center" pr={16} onClick={mobileDrawer[1].open}>
            <ActionIcon variant="transparent" color="dark" radius={100} id="nav-other-routes">
              <IconDotsVertical strokeWidth={1.2} />
            </ActionIcon>
          </Group>

          <Drawer
            opened={mobileDrawer[0]}
            onClose={mobileDrawer[1].close}
            position="right"
            size={240}
            title={
              <Group
                gap={10}
                onClick={() => {
                  router.push("/workspace");
                  mobileDrawer[1].close();
                }}
              >
                <Avatar workspace={workspace.userMember.workspace} size={30} />
                <Text fw={600}>{StringUtils.limitCharacters(workspace.userMember.workspace.name || "", 12)}</Text>
              </Group>
            }
          >
            <Stack>
              {navigationGroup.map((group) => {
                return (
                  <Fragment key={group.id}>
                    <Divider tt="capitalize" label={group.name || t("general")} labelPosition="left" />

                    {group.moduleIds.map((moduleId) => {
                      const module = workspace.modules.find((v) => v.id === moduleId);
                      if (!module) return null;
                      const isActive = router.pathname === module.href;
                      const moduleColor = isActive ? color("primary") : "var(--mantine-color-text)";

                      return (
                        <Group
                          key={moduleId}
                          onClick={() => {
                            router.push(module.href);
                            mobileDrawer[1].close();
                          }}
                          variant="subtle"
                          justify="flex-start"
                          color="var(--mantine-color-text)"
                          py={2}
                        >
                          <Group gap={8}>
                            <ThemeIcon color={moduleColor} variant={isActive ? "filled" : "transparent"}>
                              <module.icon strokeWidth={isActive ? 1.8 : 1.5} size={20} />
                            </ThemeIcon>

                            <Text tt="capitalize" fw={500} c={moduleColor}>
                              {t(module.name)}
                            </Text>

                            <Renderer visible={!!module.isBeta}>
                              <Badge color="orange" size="xs">
                                Beta
                              </Badge>
                            </Renderer>
                          </Group>
                        </Group>
                      );
                    })}
                  </Fragment>
                );
              })}
            </Stack>
          </Drawer>
        </Renderer>
      </Group>
    );
  }

  const navigationGroup = getNavigationGroups(components, workspace.availableModules);

  return (
    <>
      <WorkspaceNavigationDrawer
        targetProps={{
          w: "100%",
          h: workspaceLayout.headerHeight,
          mih: workspaceLayout.headerHeight,
          style: {
            borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
          },
        }}
      />

      <ScrollArea.Autosize type="never" scrollbars="y">
        <Stack
          w="100%"
          id="app-navigation"
          gap={workspaceLayout.isNavbarCollapsed ? 5 : 0}
          pb={16}
          pt={workspaceLayout.isNavbarCollapsed ? 5 : 10}
        >
          {navigationGroup.map((group) => {
            return (
              <Fragment key={group.id}>
                <Renderer visible={group.id !== "default" && !workspaceLayout.isNavbarCollapsed}>
                  <Divider tt="capitalize" label={group.name} labelPosition="left" px={12} py={10} />
                </Renderer>

                <Renderer visible={group.id !== "default" && workspaceLayout.isNavbarCollapsed}>
                  <Divider my={5} />
                </Renderer>

                {group.moduleIds.map((moduleId) => {
                  const module = workspace.modules.find((v) => v.id === moduleId);
                  if (!module) return null;

                  return (
                    <WorkspaceNavigationMenu
                      key={moduleId}
                      icon={module.icon}
                      route={module.href}
                      label={t(module.name)}
                      isBeta={module.isBeta}
                      exact={["/"].includes(module.href)}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    </>
  );
};
