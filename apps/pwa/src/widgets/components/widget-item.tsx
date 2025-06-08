import { Group } from '@mantine/core'
import { WidgetComponent, WidgetConfig, WidgetProps } from '../types'

export function WidgetItem<ContextType = any, WidgetType = string>(props: WidgetProps<ContextType, WidgetType> & {
  config: WidgetConfig,
  component: WidgetComponent<ContextType, WidgetType>
}) {
  const { id, widgetsContext } = props;

  const { widgets } = widgetsContext;

  const _widget = widgets.find(v => v.id === id)!;
  const widget = { ..._widget, ...props.config };

  return <Group
    id={id}
    widget-id={id}
    w="100%"
    h="100%"
    justify="center"
    align="center"
    pos="relative"
    className="no-focus-visible"
  >
    <props.component
      {...props}
      widget={widget}
      ctx={props.ctx}
    />
  </Group>
}