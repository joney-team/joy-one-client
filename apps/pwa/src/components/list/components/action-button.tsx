"use client";

import { NumberFormat } from "@/components/format/number-format";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Badge, Button, Group, Text, Tooltip } from "@mantine/core";
import { Icon, IconX } from "@tabler/icons-react";
import { FC, MouseEventHandler, PropsWithChildren, ReactNode } from "react";

interface ActionButtonProps {
  icon?: Icon;
  activeIcon?: Icon;
  iconSize?: number;
  active?: boolean;
  label?: string | null | ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  quantity?: number;
  quantityColor?: string;
  onClear?: MouseEventHandler<HTMLElement>;
  withBorder?: boolean;
  borderStyle?: "solid" | "dashed";
  disabled?: boolean;
  tooltip?: string;
}

export const ActionButton: FC<PropsWithChildren<ActionButtonProps>> = ({
  icon,
  activeIcon,
  label,
  onClick,
  active,
  children,
  iconSize = 16,
  quantity,
  quantityColor,
  onClear,
  withBorder = true,
  borderStyle = "solid",
  disabled = false,
  tooltip,
}) => {
  const color = useColor();
  const Icon = active && activeIcon ? activeIcon : icon;

  return (
    <Tooltip label={tooltip} disabled={!!!tooltip}>
      <Button
        variant="outline"
        px={8}
        h={26}
        color={color(active ? "primary" : "var(--mantine-color-dimmed)")}
        size="compact-sm"
        disabled={disabled}
        style={{
          cursor: "pointer",
          borderColor: color(
            withBorder ? (active ? "primary" : "var(--mantine-color-placeholder)") : "transparent"
          ),
          borderStyle: borderStyle,
        }}
        className="unselectable"
        onClick={onClick}
      >
        <Group wrap="nowrap" gap={5}>
          {Icon && (
            <Icon
              size={iconSize}
              color={color(
                disabled
                  ? "var(--mantine-color-dimmed)"
                  : active
                  ? "primary"
                  : "var(--mantine-color-dimmed)"
              )}
              strokeWidth={1.8}
            />
          )}
          {label && (
            <Text fz={12} fw={500}>
              {label}
            </Text>
          )}

          {quantity && quantity > 0 && (
            <Badge size="xs" variant="outline" color={color(quantityColor || "primary")} px={5}>
              <NumberFormat value={quantity} />
            </Badge>
          )}

          {children}

          {onClear && (
            <ActionIcon
              component="div"
              variant="subtle"
              color="var(--mantine-color-dimmed)"
              size="compact-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return onClear?.(e);
              }}
            >
              <IconX size={13} />
            </ActionIcon>
          )}
        </Group>
      </Button>
    </Tooltip>
  );
};
