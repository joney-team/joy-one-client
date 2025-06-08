import { ActionIcon, Card, Group, Tooltip } from "@mantine/core";
import { IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { FC } from "react";
import { ListContext } from "../types";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@/modules/lang/lang-service";

export const ToggleView: FC<ListContext> = (props) => {
  const color = useColor();

  if (!props.card) return null;

  return (
    <Card p={0} shadow="none" withBorder>
      <Group gap={0}>
        <Tooltip label={t("table")}>
          <ActionIcon
            variant={props.viewState.view === "table" ? "filled" : "subtle"}
            color={props.viewState.view === "table" ? color("primary") : color("dimmed")}
            size={26}
            w={30}
            onClick={() => props.setViewState({ ...props.viewState, view: "table" })}
            style={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <IconTable size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={t("grid")}>
          <ActionIcon
            variant={props.viewState.view === "grid" ? "filled" : "subtle"}
            color={props.viewState.view === "grid" ? color("primary") : color("dimmed")}
            size={26}
            w={30}
            onClick={() => props.setViewState({ ...props.viewState, view: "grid" })}
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
