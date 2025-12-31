"use client";

import { Card, Group, Stack, Text } from "@mantine/core";
import { Icon, ReactNode } from "@tabler/icons-react";
import { MouseEventHandler, useRef } from "react";

import styles from "./context-menu.module.css";
import { useClickOutside } from "@mantine/hooks";

interface ContextMenuItemProps {
  icon: Icon;
  label: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
}

export const ContextMenuItem = ({ icon: Icon, label, onClick }: ContextMenuItemProps) => {
  return (
    <Group onClick={onClick} gap="xs" className={styles.ContextMenuItem}>
      <Icon size={16} color="gray" />
      <Text fz="xs">{label}</Text>
    </Group>
  );
};

export const ContextMenuDropdown = ({
  children,
  onClickOutside,
}: {
  children: ReactNode;
  onClickOutside?: () => void;
}) => {
  const ref = useClickOutside(() => onClickOutside?.());

  return (
    <Card shadow="sm" withBorder p={5} ref={ref}>
      <Stack gap={0}>{children}</Stack>
    </Card>
  );
};
