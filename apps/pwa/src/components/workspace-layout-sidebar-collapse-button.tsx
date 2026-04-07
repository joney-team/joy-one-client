import { useNavigationWidth, workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import { type FC } from "react";

interface WorkspaceLayoutSidebarCollapseButton extends Omit<ActionIconProps, "onClick"> {}

export const WorkspaceLayoutSidebarCollapseButton: FC<WorkspaceLayoutSidebarCollapseButton> = (
  props,
) => {
  const { setNavigationWidth, isNavbarCollapsed } = useNavigationWidth();

  return (
    <ActionIcon
      variant="subtle"
      color="gray.6"
      {...props}
      onClick={() => {
        setNavigationWidth(
          isNavbarCollapsed
            ? workspaceLayoutConfig.defaultNavigationExpandedWidth
            : workspaceLayoutConfig.minNavigationWidth,
        );
      }}
    >
      {isNavbarCollapsed ? (
        <IconLayoutSidebarLeftExpand strokeWidth={1.5} size={20} />
      ) : (
        <IconLayoutSidebarLeftCollapse strokeWidth={1.5} size={20} />
      )}
    </ActionIcon>
  );
};
