"use client";

import { ActionIcon, Group } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { FC, PropsWithChildren } from "react";

interface ContentEditHoverProps {
  onEdit: () => void;
}

export const ContentEditHover: FC<PropsWithChildren<ContentEditHoverProps>> = (props) => {
  const hover = useHover();
  return (
    <Group ref={hover.ref} gap={8}>
      {props.children}

      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={props.onEdit}
        opacity={hover.hovered ? 1 : 0}
        disabled={!hover.hovered}
      >
        <IconPencil size={18} />
      </ActionIcon>
    </Group>
  );
};
