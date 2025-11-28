"use client";

import { Button } from "@/components/buttons/button";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { useListContext } from "../list-context";
import { Trans } from "@lingui/react/macro";

export const CreateButton: FC = () => {
  const context = useListContext();
  const layout = useLayout();
  const workspace = useWorkspace();
  const color = useColor();

  if (
    !context.creatable ||
    (context.creatable.permission && !workspace.hasPermission(context.creatable.permission))
  )
    return null;

  const baseProps =
    "href" in context.creatable
      ? {
          component: Link,
          href: context.creatable.href,
        }
      : {
          onClick: context.creatable.onCreate,
        };

  if (layout.view === "mobile") {
    return (
      <ActionIcon color={color("primary")} size={26} {...(baseProps as ActionIconProps)}>
        {context.creatable.icon ? <context.creatable.icon size={16} /> : <IconPlus size={16} />}
      </ActionIcon>
    );
  }

  return (
    <Button
      leftIcon={context.creatable.icon || IconPlus}
      iconSize={16}
      size="compact-sm"
      label={context.creatable.label || <Trans>Create</Trans>}
      {...baseProps}
    />
  );
};
