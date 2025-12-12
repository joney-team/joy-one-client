"use client";

import { ContextMenuDropdownComponent } from "@/components/context-menu/context-menu-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getId } from "@joy-one-client/utils/base-data";
import { Trans } from "@lingui/react/macro";
import { Box, Card, Stack, Text } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { ReactNode, useMemo } from "react";
import { useListContext } from "../list-context";

import Link from "next/link";
import styles from "./table-context-menu-dropdown.module.css";

const MenuItem = ({
  icon: Icon,
  disabled,
  label,
  onClose,
  ...props
}: {
  icon: Icon;
  disabled?: boolean;
  label: ReactNode;
  onClose: () => void;
} & ({ href: string } | { onClick: () => void })) => {
  const href = typeof props === "object" && "href" in props ? props.href : null;
  const onClick = typeof props === "object" && "onClick" in props ? props.onClick : null;

  if (href) {
    return (
      <Box className={styles.MenuItem} component={Link} href={href}>
        <Icon size={16} color="gray" />
        <Text fz={14}>{label}</Text>
      </Box>
    );
  }

  return (
    <Box
      className={styles.MenuItem}
      onClick={async () => {
        onClick?.();
        onClose();
      }}
    >
      <Icon size={16} color="gray" />
      <Text fz={14}>{label}</Text>
    </Box>
  );
};

export const TableContextMenuDropdown: ContextMenuDropdownComponent = ({ data, onClose }) => {
  const context = useListContext();
  const workspace = useWorkspace();

  const contextMenuDropdown = useMemo(() => {
    if (!data) return null;
    const rowData = context.list.data.find((v) => getId(v) === getId(data));

    if (!rowData) return null;

    const availableSelectBulkActions = context.bulkActions.filter((bulkAction) => {
      const isAvailable = bulkAction.available?.(context.list.data) ?? true;
      const isHasPermission = bulkAction.permission
        ? workspace.hasPermission(bulkAction.permission)
        : true;

      return isAvailable && isHasPermission;
    });

    if (availableSelectBulkActions.length === 0 && context.actions.length === 0) {
      onClose();
      return null;
    }

    return (
      <Stack p={5} gap={0}>
        {context.actions.map((action, index) => {
          const isDisabled =
            (action.disabled && action.disabled?.(rowData) === true) ||
            (action.permission && !workspace.hasPermission(action.permission));

          const props =
            typeof action === "object" && "href" in action
              ? { href: action.href(rowData) }
              : { onClick: () => action.onClick(rowData) };

          return (
            <MenuItem
              key={index}
              icon={action.icon}
              disabled={isDisabled}
              label={action.label}
              {...props}
              onClose={onClose}
            />
          );
        })}

        {availableSelectBulkActions.map((bulkAction, index) => {
          return (
            <MenuItem
              key={index}
              icon={bulkAction.icon}
              onClick={() =>
                bulkAction.handler([rowData], {
                  unSelect: context.unselectAll,
                  refetch: context.list.fetch,
                })
              }
              label={bulkAction.label ?? <Trans>Action</Trans>}
              onClose={onClose}
            />
          );
        })}
      </Stack>
    );
  }, [context.pointedId]);

  return (
    <Card shadow="sm" p={0} withBorder>
      {contextMenuDropdown}
    </Card>
  );
};
