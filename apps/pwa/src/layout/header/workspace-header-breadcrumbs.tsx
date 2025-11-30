"use client";

import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import {
  useAvailableWorkspaceModules,
  useWorkspaceModules,
  WorkspaceModule,
} from "@/modules/workspaces/workspace-modules";
import { Card, Group, Text, ThemeIcon } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { FC, Fragment } from "react";

const BreadcrumbDivider: FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <ThemeIcon color="gray" variant="transparent" size="xs" mx={-3}>
      <IconChevronRight size={14} strokeWidth={1.5} />
    </ThemeIcon>
  );
};

function getParentModules(pathname: string, modules: WorkspaceModule[]): WorkspaceModule[] {
  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build all possible parent paths
  const parentPaths = segments.map((_, index) => "/" + segments.slice(0, index + 1).join("/"));

  // Filter out the current path and get parent modules
  return modules.filter((mo) => parentPaths.includes(mo.href) && mo.href !== pathname);
}

export const WorkspaceHeaderBreadcrumbs: FC = () => {
  const router = useRouter();
  const layout = useLayout();
  const { availableModules, getModuleByHref } = useAvailableWorkspaceModules();

  const activatedModule = getModuleByHref(router.pathname);
  const parentActivatedModule = availableModules.find(
    (m) => m.href === `/${router.pathname.split("/")[1]}` && m.id !== activatedModule?.id
  );

  const parentModules = getParentModules(router.pathname, availableModules);

  const ignoreModules = ["tasks"];

  if (
    (!activatedModule && !parentActivatedModule) ||
    ignoreModules.includes(activatedModule?.id || parentActivatedModule?.id || "")
  )
    return null;

  return (
    <Group gap={0} align="center">
      {parentModules.length > 0 &&
        parentModules.map((mo) => {
          return (
            <Fragment key={mo.id}>
              <BreadcrumbItem moduleId={mo.id} />
              <BreadcrumbDivider enabled={!!activatedModule} />
            </Fragment>
          );
        })}

      {!!activatedModule && <BreadcrumbItem moduleId={activatedModule.id} />}

      {layout.components.head && (
        <Fragment>
          <BreadcrumbDivider enabled={!!activatedModule || !!parentActivatedModule} />

          {typeof layout.components.head === "string" ? (
            <Text fz={13} fw={500} px={8} truncate="end">
              {layout.components.head}
            </Text>
          ) : (
            <Text fz={13} fw={500} px={8} truncate="end" component="div">
              {layout.components.head}
            </Text>
          )}
        </Fragment>
      )}
    </Group>
  );
};

const BreadcrumbItem: FC<{ moduleId: string }> = ({ moduleId }) => {
  const hover = useHover();
  const router = useRouter();
  const color = useColor();

  const { getModule } = useWorkspaceModules();
  const workspaceModule = getModule(moduleId);

  if (!workspaceModule) return null;

  return (
    <Link href={workspaceModule.href} style={{ textDecoration: "none" }}>
      <Card
        withBorder={false}
        shadow="none"
        ref={hover.ref}
        bg={color(hover.hovered ? "var(--mantine-color-default-hover)" : "transparent")}
        onClick={() => router.push(workspaceModule.href)}
        p={2}
      >
        <Group gap={0}>
          <Text fz={13} fw={500} px={4}>
            {workspaceModule.name}
          </Text>
        </Group>
      </Card>
    </Link>
  );
};
