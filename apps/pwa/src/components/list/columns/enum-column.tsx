import { Circle } from "@/components/circle";
import { objUnselect } from "@joy-one-client/utils/object";
import { Group, Text } from "@mantine/core";
import { Icon, IconChartBubble } from "@tabler/icons-react";
import { Column } from "../types";
import { useColor } from "@/modules/theme/use-color";

export interface EnumColumnArgs extends Omit<Column, "render"> {
  multiple?: boolean;
  options: {
    label: string;
    value: string;
    color?: string;
    icon?: Icon;
  }[];
}

export const EnumColumn = (args: EnumColumnArgs): Column => {
  return {
    ...(args ? objUnselect(args, ["options"]) : {}),
    w: args?.w || 150,
    icon: args?.icon || IconChartBubble,
    render: ({ value }) => {
      const color = useColor();
      const option = args?.options.find((v) => v.value === value);
      if (!option) return null;
      return (
        <Group gap={5}>
          {option.icon ? (
            <option.icon size={18} color={color(option.color)} />
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

            return (
              <Group gap={5}>
                {v.icon ? (
                  <v.icon size={18} color={color(v.color)} />
                ) : v.color ? (
                  <Circle color={color(v.color)} size={8} />
                ) : null}

                <Text fz={14} fw={500}>
                  {v.label}
                </Text>
              </Group>
            );
          },
        })),
        dropdownProps: {
          miw: (args?.w || 150) + 15,
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
