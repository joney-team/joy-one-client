"use client";

import { Anchor, AnchorProps, Group, Text } from "@mantine/core";
import { FC, PropsWithChildren, useMemo } from "react";
import { Hovered } from "./hovered";
import Link from "next/link";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";

interface ClickableProps extends AnchorProps {
  blank?: boolean;
  href?: string;
  onClick?: () => any;
  disabled?: boolean;
  permission?: WorkspacePermission;
  children: string;
}

export const Clickable: FC<PropsWithChildren<ClickableProps>> = (props) => {
  const { blank, href, onClick, disabled, ...rest } = props;
  const workspace = useWorkspace();
  const isHasPermission = props.permission ? workspace.hasPermission(props.permission) : true;

  if (disabled || !isHasPermission) {
    return props.children;
  }

  const content = useMemo(() => {
    if (href) {
      return (
        <Anchor
          href={href}
          component={Link}
          target={blank ? "_blank" : "_self"}
          maw="100%"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
          truncate
          {...rest}
          title={props.children}
        >
          {props.children}
        </Anchor>
      );
    }

    return (
      <Text truncate title={props.children}>
        {props.children}
      </Text>
    );
  }, [href, blank, rest, props.children]);

  return (
    <Hovered>
      {(hover) => {
        return (
          <Group
            ref={hover.ref}
            px={5}
            py={1}
            maw="100%"
            style={{
              cursor: "pointer",
              borderRadius: 5,
              background: hover.hovered ? "var(--mantine-color-gray-2)" : "transparent",
            }}
            onClick={onClick}
          >
            {content}
          </Group>
        );
      }}
    </Hovered>
  );
};
