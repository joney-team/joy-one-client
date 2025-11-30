"use client";

import { Avatar } from "@/components/avatar";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  useAvailableWorkspaceModules,
  useWorkspaceModules,
  WorkspaceModuleId,
} from "@/modules/workspaces/workspace-modules";
import { getDefaultWorkspaceView, getNavigationGroups } from "@/modules/workspaces/workspace-view";
import { nonLoading } from "@/utils/non-loading";
import { String } from "@/utils/string.utils";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
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
import dynamic from "next/dynamic";
import { FC, Fragment, useMemo } from "react";
import { Renderer } from "../../components/renderer";
import { useWorkspaceLayout, workspaceLayoutConfig } from "../hooks/use-workspace-layout";
import { WorkspaceNavigationMenu } from "./workspace-navigation-menu";

const WorkspaceNavigationDrawer = dynamic(
  () => import("./navigation-drawer").then((mod) => mod.WorkspaceNavigationDrawer),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const WorkspaceNavigation: FC = () => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const { availableModules, isModuleAvailable, getAvailableModule } =
    useAvailableWorkspaceModules();
  const { getModule } = useWorkspaceModules();
  const workspaceLayout = useWorkspaceLayout();
  const router = useRouter();
  const color = useColor();

  const mobileDrawer = useDisclosure(false);

  const components = (
    workspace.view.menu ??
    getDefaultWorkspaceView(workspace.type).menu ??
    []
  ).filter((v) => {
    if (v.type === "MODULE") return !!isModuleAvailable(v.moduleId as WorkspaceModuleId);
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
      availableModules
    );

    return (
      <Group
        justify="space-around"
        wrap="nowrap"
        style={{ width: "100%", height: workspaceLayout.navigationHeight }}
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
                <Avatar workspace={workspace.userMember.workspace} size={30} />
                <Text fw={600}>
                  {String.limitCharacters(workspace.userMember.workspace.name || "", 12)}
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

  const navigationGroup = useMemo(() => {
    return getNavigationGroups(components, availableModules);
  }, [components, availableModules]);

  return (
    <Fragment>
      <WorkspaceNavigationDrawer
        targetProps={{
          w: "100%",
          h: workspaceLayoutConfig.headerHeight,
          mih: workspaceLayoutConfig.headerHeight,
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
                  <Divider
                    tt="capitalize"
                    label={group.name}
                    labelPosition="left"
                    px={12}
                    py={10}
                  />
                </Renderer>

                <Renderer visible={group.id !== "default" && workspaceLayout.isNavbarCollapsed}>
                  <Divider my={5} />
                </Renderer>

                {group.moduleIds.map((moduleId) => {
                  const module = getModule(moduleId);
                  if (!module) return null;

                  return (
                    <WorkspaceNavigationMenu
                      key={moduleId}
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
