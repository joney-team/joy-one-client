"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { type ModalTagFormRef } from "@/modules/tags/modals/modal-tag-form";
import { TagType } from "@/modules/tags/tags-types";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { type ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import { parseTaskPath, updateTaskPath } from "@/modules/tasks/tasks-route-helpers";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Badge,
  em,
  Group,
  Indicator,
  Menu,
  MenuDropdown,
  rgba,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Icon, IconDots, IconFolderPlus, IconPlus, IconTarget } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo, useRef, type FC, type ReactNode } from "react";
import { useWorkspaceLayout, workspaceLayoutConfig } from "../hooks/use-workspace-layout";
import { type ModalConfigureStatusesRef } from "@/modules/tasks/modals/modal-configure-statuses";
import { useLocalStorage } from "@mantine/hooks";
import { TaskView } from "@/modules/tasks/views/types";
import { StorageKey } from "@/types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";

const ModalConfigureStatuses = dynamic(
  () =>
    import("@/modules/tasks/modals/modal-configure-statuses").then(
      (mod) => mod.ModalConfigureStatuses
    ),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalTagForm = dynamic(
  () => import("@/modules/tags/modals/modal-tag-form").then((mod) => mod.ModalTagForm),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const WorkspaceNavigationTaskFolders = dynamic(
  () =>
    import("@/layout/navigation/workspace-navigation-task-folders").then(
      (mod) => mod.WorkspaceNavigationTaskFolders
    ),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const WorkspaceNavigationMenu: FC<{
  icon: Icon;
  label: ReactNode;
  route: string;
  indicator?: number;
  exact?: boolean;
  isBeta?: boolean;
}> = (props) => {
  const router = useRouter();
  const layout = useLayout();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const color = useColor();
  const modalTagFormRef = useRef<ModalTagFormRef>(null);
  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);
  const modalConfigureStatusesRef = useRef<ModalConfigureStatusesRef>(null);
  const [localTaskView] = useLocalStorage<TaskView>({
    key: StorageKey.TASKS_VIEW,
    defaultValue: TaskView.LIST,
  });

  const { folders } = useTaskFolders();

  const id = `nav-route-${props.route.replace("/", "").replace(/\//g, "-")}`;

  const isActive =
    pathname === props.route ||
    (!props.exact && pathname.startsWith(props.route) && !pathname.startsWith(props.route + "-"));

  const route = useMemo(() => {
    if (!layout.isInitialized) return "";

    if (props.route === "/tasks") {
      return `/tasks/${localTaskView}/d`;
    }

    return props.route;
  }, [props.route, layout.isInitialized, pathname, localTaskView]);

  if (layout.view === "mobile") {
    return (
      <Stack
        id={id}
        align="center"
        justify="center"
        gap={0}
        onClick={() => router.push(route)}
        style={{ cursor: "pointer", userSelect: "none", height: "100%" }}
        flex={1}
        h={workspaceLayoutConfig.mobileNavigationHeight}
      >
        <Indicator
          size="lg"
          offset={5}
          color="red"
          label={
            <Text fz={8} fw={700}>
              {props.indicator && <NumberFormat value={props.indicator} />}
            </Text>
          }
          disabled={!props.indicator || props.indicator === 0}
        >
          <ActionIcon
            variant="transparent"
            color={color(isActive ? "primary" : "var(--mantine-color-text)")}
          >
            <props.icon strokeWidth={1.5} />
          </ActionIcon>
        </Indicator>
        <Text
          tt="capitalize"
          mt={-3}
          fz={10}
          fw={500}
          c={color(isActive ? "primary" : "var(--mantine-color-text)")}
        >
          {props.label}
        </Text>
      </Stack>
    );
  }

  if (workspaceLayout.isNavbarCollapsed) {
    return (
      <Fragment>
        <Group justify="center">
          <Tooltip label={props.label} position="right">
            <Anchor component={Link} href={route} td="none">
              <ActionIcon
                size="xl"
                variant={isActive ? "light" : "subtle"}
                color={color(isActive ? "primary" : "var(--mantine-color-text)")}
              >
                <props.icon strokeWidth={isActive ? 1.8 : 1.5} size={22} />
              </ActionIcon>
            </Anchor>
          </Tooltip>
        </Group>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Anchor component={Link} href={route} td="none" style={{ outline: "none" }}>
        <Group
          id={id}
          justify="start"
          gap={8}
          px={10}
          py={3}
          style={{
            cursor: "pointer",
            userSelect: "none",
          }}
          w="100%"
        >
          <Group
            flex={1}
            gap={5}
            style={{
              background: isActive
                ? colorScheme === "dark"
                  ? rgba(color("primary"), 0.1)
                  : color("primary.0")
                : "transparent",
              border: `1px solid ${
                isActive
                  ? colorScheme === "dark"
                    ? rgba(color("primary"), 0.5)
                    : color("primary.1")
                  : "transparent"
              }`,
              borderRadius: 10,
            }}
            px={5}
            py={2}
            align="center"
          >
            <ActionIcon
              size={30}
              variant="transparent"
              color={color(isActive ? "primary" : "var(--mantine-color-text)")}
            >
              <props.icon strokeWidth={isActive ? 1.8 : 1.5} size={22} />
            </ActionIcon>

            <Group gap={5} justify="space-between" flex={1} miw={0}>
              <Group gap={5} wrap="nowrap" miw={0}>
                <Text
                  tt="capitalize"
                  fz={14}
                  fw={500}
                  c={color(isActive ? "primary" : "var(--mantine-color-text)")}
                  truncate
                >
                  {props.label}
                </Text>

                <Renderer visible={!!props.isBeta}>
                  <Badge color="orange" size="xs">
                    Beta
                  </Badge>
                </Renderer>
              </Group>

              {props.route === "/tasks" && (
                <Group gap={0} onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        color={color(isActive ? "primary" : "var(--mantine-color-text)")}
                        radius={5}
                      >
                        <IconDots strokeWidth={1.5} size={12} />
                      </ActionIcon>
                    </Menu.Target>

                    <MenuDropdown>
                      <Menu.Item
                        leftSection={<IconTarget size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          modalConfigureStatusesRef.current?.open({
                            contextType: null,
                            contextId: null,
                          });
                        }}
                      >
                        <Text fz={14}>
                          <Trans>Task statuses</Trans>
                        </Text>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconPlus size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          modalCreateTaskRef.current?.open();
                        }}
                      >
                        <Text fz={14}>
                          <Trans>Create task</Trans>
                        </Text>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconFolderPlus size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          modalTagFormRef.current?.open({
                            type: TagType.TASK_FOLDER,
                            onCreated: (tag) => {
                              router.push(updateTaskPath({ slug: tag.slug }));
                            },
                          });
                        }}
                      >
                        <Text fz={14}>
                          <Trans>Create folder</Trans>
                        </Text>
                      </Menu.Item>
                    </MenuDropdown>
                  </Menu>
                </Group>
              )}
            </Group>
          </Group>
        </Group>
      </Anchor>

      {props.route === "/tasks" &&
        (isActive || workspace.type === WorkspaceType.SOFTWARE) &&
        folders.length > 0 && <WorkspaceNavigationTaskFolders />}

      <ModalTagForm ref={modalTagFormRef} />
      <ModalCreateTask ref={modalCreateTaskRef} />
      <ModalConfigureStatuses ref={modalConfigureStatusesRef} />
    </Fragment>
  );
};
