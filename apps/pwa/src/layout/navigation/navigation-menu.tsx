"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { WorkspaceNavigationTaskFolders } from "@/layout/navigation/navigation-task-folders";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { useTags } from "@/modules/tags/tags-context";
import { TagType } from "@/modules/tags/tags-types";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
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
import {
  Icon,
  IconChevronDown,
  IconChevronUp,
  IconFolderPlus,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC, Fragment, useState } from "react";
import { useWorkspaceLayout, workspaceLayoutConfig } from "../hooks/use-workspace-layout";

export const WorkspaceNavigationMenu: FC<{
  icon: Icon;
  label: React.ReactNode;
  route: string;
  indicator?: number;
  exact?: boolean;
  isBeta?: boolean;
}> = (props) => {
  const id = `nav-route-${props.route.replace("/", "").replace(/\//g, "-")}`;
  const [isShowTaskFolder, setIsShowTaskFolder] = useState(
    localStorage.getItem(`task-folder`) === "true"
  );

  const onToggleShowTaskFolders = () => {
    setIsShowTaskFolder(!isShowTaskFolder);
    localStorage.setItem(`task-folder`, (!isShowTaskFolder).toString());
  };

  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const pathname = usePathname();
  const isActive =
    pathname === props.route ||
    (!props.exact && pathname.startsWith(props.route) && !pathname.startsWith(props.route + "-"));
  const router = useRouter();
  const tags = useTags();
  const taskFolderTags = tags.list.filter((v) => v.type === TagType.TASK_FOLDER);
  const colorScheme = useColorScheme();
  const color = useColor();
  const taskFolders = useTaskFolders();

  const getRoute = () => {
    if (props.route === "/tasks") {
      return `/tasks/${taskFolders.view}/d`;
    }

    return props.route;
  };

  if (layout.view === "mobile")
    return (
      <Stack
        id={id}
        align="center"
        justify="center"
        gap={0}
        onClick={() => router.push(getRoute())}
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

  if (workspaceLayout.isNavbarCollapsed)
    return (
      <Fragment>
        <Group justify="center">
          <Tooltip label={props.label} position="right">
            <Anchor component={Link} href={getRoute()} td="none">
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

  return (
    <Fragment>
      <Anchor component={Link} href={getRoute()} td="none">
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
              variant={isActive ? "subtle" : "transparent"}
              color={color(isActive ? "primary" : "var(--mantine-color-text)")}
            >
              <props.icon strokeWidth={isActive ? 1.8 : 1.5} size={em(22)} />
            </ActionIcon>

            <Group gap={5} justify="space-between" flex={1}>
              <Group gap={5}>
                <Text
                  tt="capitalize"
                  fz={em(14)}
                  fw={500}
                  c={color(isActive ? "primary" : "var(--mantine-color-text)")}
                >
                  {props.label}
                </Text>

                <Renderer visible={!!props.isBeta}>
                  <Badge color="orange" size="xs">
                    Beta
                  </Badge>
                </Renderer>
              </Group>

              <Renderer visible={props.route === "/tasks"}>
                <Group gap={0} onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        variant="subtle"
                        color={color(isActive ? "primary" : "var(--mantine-color-text)")}
                        size="sm"
                        radius={5}
                      >
                        <IconPlus strokeWidth={1.5} size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <MenuDropdown>
                      <Menu.Item
                        leftSection={<IconPlus size={16} />}
                        onClick={() => OnModalCreateTask()}
                      >
                        <Text tt="capitalize" fz={em(14)}>
                          <Trans>Create task</Trans>
                        </Text>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconFolderPlus size={16} />}
                        onClick={() =>
                          OnModalTagForm({
                            type: TagType.TASK_FOLDER,
                            onDone: (tag) => router.push(`/tasks?fs=${tag._id}`),
                          })
                        }
                      >
                        <Text tt="capitalize" fz={em(14)}>
                          <Trans>Create folder</Trans>
                        </Text>
                      </Menu.Item>
                    </MenuDropdown>
                  </Menu>

                  {taskFolders.list.length > 0 && (
                    <ActionIcon
                      variant="subtle"
                      color={color(isActive ? "primary" : "var(--mantine-color-text)")}
                      size="sm"
                      radius={5}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onToggleShowTaskFolders();
                      }}
                    >
                      {isShowTaskFolder ? (
                        <IconChevronUp strokeWidth={1.5} size={16} />
                      ) : (
                        <IconChevronDown strokeWidth={1.5} size={16} />
                      )}
                    </ActionIcon>
                  )}
                </Group>
              </Renderer>
            </Group>
          </Group>
        </Group>
      </Anchor>

      <Renderer visible={props.route === "/tasks" && taskFolderTags.length > 0 && isShowTaskFolder}>
        <WorkspaceNavigationTaskFolders />
      </Renderer>
    </Fragment>
  );
};
