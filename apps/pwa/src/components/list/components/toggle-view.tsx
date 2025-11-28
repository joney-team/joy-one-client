"use client";

import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Tooltip } from "@mantine/core";
import { IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { FC } from "react";
import { useListContext } from "../list-context";

export const ToggleView: FC = () => {
  const context = useListContext();
  const color = useColor();

  if (!context.card) return null;

  return (
    <Card p={0} shadow="none" withBorder>
      <Group gap={0}>
        <Tooltip label={<Trans>Table</Trans>}>
          <ActionIcon
            variant={context.viewState.view === "table" ? "filled" : "subtle"}
            color={context.viewState.view === "table" ? color("primary") : color("dimmed")}
            size={26}
            w={30}
            onClick={() => context.setViewState({ ...context.viewState, view: "table" })}
            style={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <IconTable size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={<Trans>Grid</Trans>}>
          <ActionIcon
            variant={context.viewState.view === "grid" ? "filled" : "subtle"}
            color={context.viewState.view === "grid" ? color("primary") : color("dimmed")}
            size={26}
            w={30}
            onClick={() => context.setViewState({ ...context.viewState, view: "grid" })}
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <IconLayoutGrid size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
};
