import { Anchor, AnchorProps, Group } from "@mantine/core";
import { FC, PropsWithChildren } from "react";
import { Hovered } from "./hovered";
import Link from "next/link";

interface ClickableProps extends AnchorProps {
  blank?: boolean;
  href?: string;
  onClick?: () => any;
}

export const Clickable: FC<PropsWithChildren<ClickableProps>> = (props) => {
  const { blank, href, onClick, ...rest } = props;

  const render = () => {
    if (href) {
      return (
        <Anchor
          href={href}
          component={Link}
          target={blank ? "_blank" : "_self"}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
          {...rest}
        >
          {props.children}
        </Anchor>
      );
    }

    return props.children;
  };

  return (
    <Hovered>
      {(hover) => {
        return (
          <Group
            ref={hover.ref}
            px={5}
            py={1}
            w="max-content"
            style={{
              cursor: "pointer",
              borderRadius: 5,
              background: hover.hovered ? "var(--mantine-color-gray-2)" : "transparent",
            }}
            onClick={onClick}
          >
            {render()}
          </Group>
        );
      }}
    </Hovered>
  );
};
