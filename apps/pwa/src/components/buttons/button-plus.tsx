import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, ActionIconProps, PolymorphicComponentProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";

interface ButtonPlusProps extends PolymorphicComponentProps<"button", ActionIconProps> {
  enabled?: boolean;
  permission?: WorkspacePermission | WorkspacePermission[];
  iconSize?: number;
}

export const ButtonPlus: FC<ButtonPlusProps> = (props) => {
  const workspace = useWorkspace();

  if (typeof props.enabled === "boolean" && !props.enabled) return null;

  if (props.permission) {
    const requiredPermissions = Array.isArray(props.permission) ? props.permission : [props.permission];
    if (!requiredPermissions.every((v) => workspace.permissions.includes(v))) return null;
  }

  const _props = { ...props };
  delete _props.enabled;
  delete _props.permission;
  delete _props.iconSize;

  return (
    <ActionIcon radius={100} size={32} {..._props}>
      <IconPlus size={props.iconSize || 20} />
    </ActionIcon>
  );
};
