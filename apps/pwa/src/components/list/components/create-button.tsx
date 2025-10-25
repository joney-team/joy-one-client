import { Button } from "@/components/buttons/button";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { ListContext } from "../types";

export const CreateButton: FC<ListContext> = (props) => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const color = useColor();

  if (
    !props.creatable ||
    (props.creatable.permission && !workspace.hasPermission(props.creatable.permission))
  )
    return null;

  const baseProps =
    "href" in props.creatable
      ? {
          component: Link,
          href: props.creatable.href,
        }
      : {
          onClick: props.creatable.onCreate,
        };

  if (layout.view === "mobile") {
    return (
      <ActionIcon color={color("primary")} size={26} {...(baseProps as ActionIconProps)}>
        {props.creatable.icon ? <props.creatable.icon size={16} /> : <IconPlus size={16} />}
      </ActionIcon>
    );
  }

  return (
    <Button
      leftIcon={props.creatable.icon || IconPlus}
      iconSize={16}
      size="compact-sm"
      label={props.creatable.label || t`Create`}
      {...baseProps}
    />
  );
};
