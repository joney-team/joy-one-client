import { useWorkspaceLayout, workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { type FC } from "react";

interface WorkspaceLayoutSidebarCollapseButton extends Omit<ActionIconProps, "onClick"> {}

export const WorkspaceLayoutSidebarCollapseButton: FC<WorkspaceLayoutSidebarCollapseButton> = (
  props
) => {
  const workspaceLayout = useWorkspaceLayout();

  return (
    <ActionIcon
      variant="subtle"
      color="gray.6"
      {...props}
      onClick={() => {
        workspaceLayout.setNavigationWidth(
          workspaceLayout.isNavbarCollapsed
            ? workspaceLayoutConfig.defaultNavigationExpandedWidth
            : workspaceLayoutConfig.minNavigationWidth
        );
      }}
    >
      {workspaceLayout.isNavbarCollapsed ? (
        <IconLayoutSidebarLeftExpand strokeWidth={1.5} size={20} />
      ) : (
        <IconLayoutSidebarLeftCollapse strokeWidth={1.5} size={20} />
      )}
    </ActionIcon>
  );
};
