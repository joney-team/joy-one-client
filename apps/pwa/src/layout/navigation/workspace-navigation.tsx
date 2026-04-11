"use client";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import {
  getDefaultWorkspaceView,
  getNavigationGroups,
} from "@/modules/workspace-settings/workspace-settings-view";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  useAvailableWorkspaceModules,
  useWorkspaceModules,
  WorkspaceModuleId,
} from "@/modules/workspaces/workspace-modules";
import { String } from "@/utils/string.utils";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical } from "@tabler/icons-react";
import { FC, Fragment, useMemo } from "react";
import { Renderer } from "../../components/renderer";
import { useNavigationWidth, workspaceLayoutConfig } from "../hooks/use-workspace-layout";
import { WorkspaceNavigationDrawer } from "./workspace-navigation-drawer";
import { WorkspaceNavigationMenu } from "./workspace-navigation-menu";

export const WorkspaceNavigation: FC = () => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const { workspaceView } = useWorkspaceSetting();
  const { isNavbarCollapsed } = useNavigationWidth();

  const { availableModules, isModuleAvailable, getAvailableModule } =
    useAvailableWorkspaceModules();

  const { getModule } = useWorkspaceModules();
  const router = useRouter();
  const color = useColor();

  const mobileDrawer = useDisclosure(false);

  const components = (
    workspaceView.menu ??
    getDefaultWorkspaceView(workspace.type).menu ??
    []
  ).filter((v) => {
    if (v.type === "MODULE") return !!isModuleAvailable(v.moduleId as WorkspaceModuleId);
    return true;
  });

  const navigationGroup = useMemo(() => {
    return getNavigationGroups(components, availableModules);
  }, [components, availableModules]);

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
      availableModules,
    );

    return (
      <Group
        justify="space-around"
        wrap="nowrap"
        style={{ width: "100%", height: "var(--app-layout-navigation-height)" }}
        gap={0}
        align="start"
      >
        {mainCpns.map((v) => {
          const mod = getAvailableModule(v.moduleId as WorkspaceModuleId);
          if (!mod) return null;

          return (
            <WorkspaceNavigationMenu
              key={v.id}
              icon={mod.icon}
              route={mod.href}
              label={mod.name}
              exact={mod.href === "/"}
            />
          );
        })}

        <Renderer visible={navigationGroup.length > 0}>
          <Group justify="center" align="center" pr={16} onClick={mobileDrawer[1].open}>
            <ActionIcon
              h={workspaceLayoutConfig.mobileNavigationHeight}
              variant="transparent"
              color="dark"
              radius={100}
              id="nav-other-routes"
            >
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
                <Avatar workspace={workspace.member.workspace} size={30} />
                <Text fw={600}>
                  {String.limitCharacters(workspace.member.workspace.name || "", 12)}
                </Text>
              </Group>
            }
          >
            <Stack>
              {navigationGroup.map((group) => {
                return (
                  <Fragment key={group.id}>
                    <Divider
                      tt="capitalize"
                      label={group.name || <Trans>General</Trans>}
                      labelPosition="left"
                    />

                    {group.moduleIds.map((modId) => {
                      const mod = getAvailableModule(modId as WorkspaceModuleId);
                      if (!mod) return null;

                      const isActive = router.pathname === mod.href;
                      const moduleColor = isActive ? color("primary") : "var(--mantine-color-text)";

                      return (
                        <Group
                          key={modId}
                          onClick={() => {
                            router.push(mod.href);
                            mobileDrawer[1].close();
                          }}
                          variant="subtle"
                          justify="flex-start"
                          color="var(--mantine-color-text)"
                          py={2}
                        >
                          <Group gap={8}>
                            <ThemeIcon
                              color={moduleColor}
                              variant={isActive ? "filled" : "transparent"}
                            >
                              <mod.icon strokeWidth={isActive ? 1.8 : 1.5} size={20} />
                            </ThemeIcon>

                            <Text tt="capitalize" fw={500} c={moduleColor}>
                              {mod.name}
                            </Text>

                            <Renderer visible={!!mod.isBeta}>
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

  return (
    <Fragment>
      <WorkspaceNavigationDrawer
        targetProps={{
          w: "100%",
          h: workspaceLayoutConfig.headerHeight,
          mih: workspaceLayoutConfig.headerHeight,
          style: {
            borderBottom: `1px solid var(--app-divider-color)`,
          },
        }}
      />

      <ScrollArea.Autosize
        type="never"
        scrollbars="y"
        styles={{
          content: {
            minWidth: 0,
          },
        }}
      >
        <Stack
          miw={0}
          id="app-navigation"
          gap={isNavbarCollapsed ? 5 : 0}
          pb={16}
          pt={isNavbarCollapsed ? 12 : 10}
        >
          {navigationGroup.map((group) => {
            return (
              <Fragment key={group.id}>
                <Renderer visible={group.id !== "default" && !isNavbarCollapsed}>
                  <Divider
                    tt="capitalize"
                    label={group.name}
                    labelPosition="left"
                    px={12}
                    py={10}
                  />
                </Renderer>

                <Renderer visible={group.id !== "default" && isNavbarCollapsed}>
                  <Divider my={5} />
                </Renderer>

                {group.moduleIds.map((moduleId, moduleIndex) => {
                  const module = getModule(moduleId);
                  if (!module) return null;

                  return (
                    <WorkspaceNavigationMenu
                      key={moduleId + moduleIndex}
                      icon={module.icon}
                      route={module.href}
                      label={module.name}
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
    </Fragment>
  );
};
