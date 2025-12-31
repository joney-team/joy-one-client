"use client";

import { Group } from "@mantine/core";
import { WidgetComponent, WidgetConfig, WidgetProps } from "../widgets-types";
import { useContextMenuItem } from "@/components/context-menu/context-menu-hooks";
import { useColor } from "@/modules/theme/use-color";

export function WidgetItem<ContextType = any, WidgetType = string>(
  props: WidgetProps<ContextType, WidgetType> & {
    config: WidgetConfig;
    component: WidgetComponent<ContextType, WidgetType>;
  }
) {
  const color = useColor();
  const { id, widgetsContext } = props;

  const { widgets } = widgetsContext;

  const _widget = widgets.find((v) => v.id === id)!;
  const widget = { ..._widget, ...props.config };
  const { isOpened } = useContextMenuItem(id);

  return (
    <Group
      id={id}
      widget-id={id}
      w="100%"
      h="100%"
      justify="center"
      align="center"
      pos="relative"
      className="no-focus-visible"
      style={{
        borderRadius: "var(--mantine-radius-md)",
        border: `1px solid ${isOpened ? color("primary.4") : "transparent"}`,
      }}
    >
      <props.component {...props} widget={widget} ctx={props.ctx} />
    </Group>
  );
}
