"use client";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { Renderer } from "@/components/renderer";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getId } from "@joy-one-client/utils/base-data";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Center, Divider, Group, Text, Tooltip } from "@mantine/core";
import { IconStack2, IconTrash, IconX } from "@tabler/icons-react";
import { FC, useMemo } from "react";
import { useListContext } from "../list-context";

export const BulkActions: FC = () => {
  const context = useListContext();
  const workspace = useWorkspace();

  const availableSelectBulkActions = useMemo(() => {
    return (context.bulkActions || []).filter(
      (v) =>
        (!v.available ||
          v.available(context.list.data.filter((i) => context.selectedIds.includes(getId(i))))) &&
        (!v.permission || workspace.hasPermission(v.permission))
    );
  }, [context.bulkActions, context.list.data, context.selectedIds, workspace.hasPermission]);

  if (
    availableSelectBulkActions.length === 0 ||
    context.selectedIds.length === 0 ||
    context.pointedId
  )
    return null;

  const selectedItems = context.list.data.filter((i: any) =>
    context.selectedIds.includes(i.id || i._id || "")
  );

  return (
    <Group
      style={{
        position: "fixed",
        bottom: 15,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
      }}
    >
      <Card withBorder shadow="none" py={0} pr={8} radius={100} bg={"dark"}>
        <Group h={45} align="center" justify="space-between" gap={5} wrap="nowrap">
          <IconStack2 size={20} strokeWidth={1.5} color="white" />
          <Group gap={3} wrap="nowrap">
            <Text c="white" fz={12} fw={600} miw={10}>
              <NumberFormat value={context.selectedIds.length} />
            </Text>
            <Text c="white" fz={12} fw={600}>
              <Trans>Selected</Trans>
            </Text>
          </Group>

          <Renderer views={["desktop", "tablet"]}>
            <Center>
              <Divider orientation="vertical" h={18} opacity={0.5} mx={8} />
            </Center>

            {availableSelectBulkActions
              .filter((v) => !v.type || v.type === "common")
              .map((action, i) => {
                return (
                  <Button
                    key={i}
                    onClick={() =>
                      action.handler(selectedItems, {
                        unSelect: () => context.unselectAll(),
                        refetch: () => context.list.refetch(),
                      })
                    }
                    leftIcon={action.icon}
                    size="compact-md"
                    h={32}
                    color="gray.5"
                    variant="transparent"
                    radius={100}
                    fz={12}
                    label={action?.label || <Trans>Actions</Trans>}
                  />
                );
              })}

            {availableSelectBulkActions.find((v) => v.type === "archive") && (
              <Button
                leftIcon={IconTrash}
                size="compact-md"
                h={32}
                color="red.5"
                variant="transparent"
                radius={100}
                fz={12}
                onClick={() =>
                  availableSelectBulkActions
                    .find((v) => v.type === "archive")
                    ?.handler(selectedItems, {
                      unSelect: () => context.unselectAll(),
                      refetch: () => context.list.refetch(),
                    })
                }
              >
                <Trans>Remove</Trans>
              </Button>
            )}

            <Tooltip label={<Trans>Unselect all</Trans>}>
              <ActionIcon
                color="gray"
                variant="subtle"
                radius={100}
                onClick={() => context.unselectAll()}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
          </Renderer>
        </Group>
      </Card>
    </Group>
  );
};
