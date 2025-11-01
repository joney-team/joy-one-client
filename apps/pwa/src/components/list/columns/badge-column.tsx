import { Circle } from "@/components/circle";
import { objUnselect } from "@joy-one-client/utils/object";
import { Badge, BadgeProps, Group, Text } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { Column } from "../types";
import { useColor } from "@/modules/theme/use-color";

export interface BadgeColumnArgs extends Column {
  multiple?: boolean;
  options: {
    label: string;
    value: string;
    color: string;
    props?: BadgeProps;
    icon?: Icon;
  }[];
}

export const badgeColumn = (args: BadgeColumnArgs): Column => {
  return {
    ...(args ? objUnselect(args, ["options"]) : {}),
    defaultWidth: args?.defaultWidth || 120,
    render: (ctx) => {
      if (args.render) return args.render(ctx);
      const color = useColor();
      const option = args?.options.find((v) => v.value === ctx.value);
      if (!option) return null;
      return (
        <Badge
          {...option.props}
          color={color(option.color)}
          fw={400}
          leftSection={option.icon ? <option.icon size={16} /> : null}
        >
          {option.label}
        </Badge>
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
              <Group gap={8}>
                {v.icon ? (
                  <v.icon size={16} color={color(v.color)} />
                ) : (
                  <Circle color={color(v.color)} size={8} />
                )}

                <Text fz={14} fw={500}>
                  {v.label}
                </Text>
              </Group>
            );
          },
        })),
      },
    },
  };
};
