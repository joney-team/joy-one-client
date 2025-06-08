import { Button } from "@/components/buttons/button";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { ListContext } from "../types";

export const CreateButton: FC<ListContext> = (props) => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const color = useColor();

  if (!props.creatable || (props.creatable.permission && !workspace.hasPermission(props.creatable.permission)))
    return null;

  if (layout.view === "mobile") {
    return (
      <ActionIcon color={color("primary")} size={26} onClick={props.creatable.onCreate}>
        {props.creatable.icon ? <props.creatable.icon size={16} /> : <IconPlus size={16} />}
      </ActionIcon>
    );
  }

  return (
    <Button
      leftIcon={props.creatable.icon || IconPlus}
      iconSize={16}
      size="compact-sm"
      onClick={props.creatable.onCreate}
      label={props.creatable.label || "create"}
    />
  );
};
