"use client";

import { useTags } from "@/modules/tags/tags-context";
import { IconMinus } from "@tabler/icons-react";
import { ActionIcon, CardProps } from "@mantine/core";
import { Group, Text } from "@mantine/core";
import { alpha } from "@mantine/core";
import { Card } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { FC } from "react";
import { Renderer } from "../../../components/renderer";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";

interface TaskTagProps extends CardProps {
  id: string;
  h?: number;
  fz?: number;
  onRemove?: () => void;
  editable?: boolean;
}

export const TaskTag: FC<TaskTagProps> = ({ id, h, fz, onRemove, editable = true, ...rest }) => {
  const tags = useTags();
  const tag = tags.list.find((v) => v._id === id);
  const hover = useHover();

  if (!tag) return null;

  const color = tag.color || "gray";

  return (
    <Card
      radius={100}
      py={0}
      px={12}
      ref={hover.ref}
      bg={alpha(color, 0.1)}
      style={{ cursor: editable ? "pointer" : "default" }}
      shadow="none"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      {...rest}
    >
      <Group mih={h ?? 28} justify="space-between" gap={5} align="center" wrap="nowrap">
        <Text fw={600} fz={fz ?? 12} c={color}>
          {tag.name}
        </Text>

        <Renderer visible={hover.hovered}>
          <Group gap={3} mr={-10} wrap="nowrap">
            <Renderer visible={editable}>
              <ActionIcon
                radius={100}
                variant="subtle"
                size="sm"
                color={color}
                onClick={() => OnModalTagForm({ tag: tag, type: tag.type })}
              >
                <IconPencil size={13} strokeWidth={2} />
              </ActionIcon>
            </Renderer>

            <Renderer visible={!!onRemove}>
              <ActionIcon radius={100} variant="subtle" size="sm" color={color} onClick={onRemove}>
                <IconMinus size={13} strokeWidth={2} />
              </ActionIcon>
            </Renderer>
          </Group>
        </Renderer>
      </Group>
    </Card>
  );
};
