import { Circle } from "@/components/circle";
import { objUnselect } from "@joy-one-client/utils/object";
import { Group, Text } from "@mantine/core";
import { Icon, IconChartBubble } from "@tabler/icons-react";
import { Column } from "../types";
import { useColor } from "@/modules/theme/use-color";

export interface EnumColumnArgs<T extends string> extends Column {
  multiple?: boolean;
  options: {
    label: string;
    value: T;
    color?: string;
    icon?: Icon;
  }[];
}

export const enumColumn = <T extends string>(args: EnumColumnArgs<T>): Column => {
  return {
    ...(args ? objUnselect(args, ["options"]) : {}),
    defaultWidth: args?.defaultWidth || 150,
    icon: args?.icon || IconChartBubble,
    render: (ctx) => {
      if (args.render) return args.render(ctx);

      const color = useColor();
      const option = args?.options.find((v) => v.value === ctx.value);
      if (!option) return null;
      return (
        <Group gap={5}>
          {option.icon ? (
            <option.icon size={18} color={option.color ? color(option.color) : undefined} />
          ) : option.color ? (
            <Circle color={color(option.color)} size={8} />
          ) : null}

          <Text fz={14} fw={500}>
            {option.label}
          </Text>
        </Group>
      );
    },
    filter: {
      staticSelector: {
        multiple: args.options.length > 2,
        options: args.options.map((v) => ({
          label: v.label,
          value: v.value,
          render: () => {
            const color = useColor();
            const iconColor = v.color ? color(v.color) : undefined;

            return (
              <Group gap={5} w="max-content">
                {v.icon ? (
                  <v.icon size={18} color={iconColor} />
                ) : v.color ? (
                  <Circle color={iconColor} size={8} />
                ) : null}

                <Text fz={14} fw={500}>
                  {v.label}
                </Text>
              </Group>
            );
          },
        })),
        dropdownProps: {
          miw: (args?.defaultWidth || 150) + 15,
        },
      },
    },
    exportToExcel: (value) => {
      const option = args?.options.find((v) => v.value === value);
      return {
        text: option?.label,
      };
    },
  };
};
