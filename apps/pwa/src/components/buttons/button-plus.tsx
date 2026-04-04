"use client";

import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, ActionIconProps, PolymorphicComponentProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, useMemo } from "react";

interface ButtonPlusProps extends PolymorphicComponentProps<"button", ActionIconProps> {
  enabled?: boolean;
  permission?: WorkspacePermission | WorkspacePermission[];
  iconSize?: number;
}

export const ButtonPlus: FC<ButtonPlusProps> = ({ enabled, permission, iconSize, ...rest }) => {
  const workspace = useWorkspace();

  const isHasPermission = useMemo(() => {
    if (!permission) return true;
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    return requiredPermissions.every((v) => workspace.hasPermission(v));
  }, [workspace.member.permissions, workspace.hasPermission]);

  if ((typeof enabled === "boolean" && !enabled) || !isHasPermission) return null;

  return (
    <ActionIcon radius={100} size={32} {...rest}>
      <IconPlus size={iconSize || 20} />
    </ActionIcon>
  );
};
