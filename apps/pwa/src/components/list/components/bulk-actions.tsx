"use client";

import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { num } from "@/modules/lang/lang-service";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Center, Divider, Group, Text, Tooltip } from "@mantine/core";
import { IconStack2, IconTrash, IconX } from "@tabler/icons-react";
import { FC } from "react";
import { ListContext } from "../types";

export const BulkActions: FC<ListContext> = (ctx) => {
  if (ctx.availableMultipleSelectActions.length === 0 || ctx.selectedIds.length === 0) return null;

  const selectedItems = ctx.list.data.filter((i: any) =>
    ctx.selectedIds.includes(i.id || i._id || "")
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
            <Text c="white" fz={14} fw={600} miw={10}>
              {num(ctx.selectedIds.length)}
            </Text>
            <Text c="white" fz={14} fw={600}>
              {t`Selected`}
            </Text>
          </Group>

          <Renderer views={["desktop", "tablet"]}>
            <Center>
              <Divider orientation="vertical" h={18} opacity={0.5} mx={8} />
            </Center>

            {ctx.availableMultipleSelectActions
              .filter((v) => !v.type || v.type === "common")
              .map((action, i) => {
                return (
                  <Button
                    key={i}
                    onClick={() =>
                      action.handler(selectedItems, {
                        unSelect: () => ctx.unselectAll(),
                        refetch: () => ctx.list.fetch(true),
                      })
                    }
                    leftIcon={action.icon}
                    iconSize={18}
                    size="compact-md"
                    h={32}
                    color="gray.5"
                    variant="transparent"
                    radius={100}
                    fz={12}
                    label={action?.label || t`Actions`}
                  />
                );
              })}

            {ctx.availableMultipleSelectActions.find((v) => v.type === "archive") && (
              <Button
                leftIcon={IconTrash}
                iconSize={18}
                size="compact-md"
                h={32}
                color="red.5"
                variant="transparent"
                radius={100}
                fz={12}
                onClick={() =>
                  ctx.availableMultipleSelectActions
                    .find((v) => v.type === "archive")
                    ?.handler(selectedItems, {
                      unSelect: () => ctx.unselectAll(),
                      refetch: () => ctx.list.fetch(true),
                    })
                }
              >
                <Trans>Remove</Trans>
              </Button>
            )}

            <Tooltip label={t`Unselect all`}>
              <ActionIcon
                color="gray"
                variant="subtle"
                radius={100}
                onClick={() => ctx.unselectAll()}
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
