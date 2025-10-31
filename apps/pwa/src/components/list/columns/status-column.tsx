import { Circle } from "@/components/circle";
import { objUnselect } from "@joy-one-client/utils/object";
import { Card, ComboboxDropdownProps, Group, Text } from "@mantine/core";
import { IconProgress } from "@tabler/icons-react";
import { ReactNode } from "react";
import { Column } from "../types";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@lingui/core/macro";

export interface StatusColumnOption {
  label: string;
  value: string;
  color: string;
}

export interface StatusColumnArgs<T> extends Omit<Column<T>, "render" | "icon"> {
  options: StatusColumnOption[];
  dropdownProps?: ComboboxDropdownProps;
  rightSection?: (value: T) => ReactNode;
}

export function StatusColumn<T = any>(args: StatusColumnArgs<T>): Column<T> {
  const dropdownProps: ComboboxDropdownProps = {
    ...args.dropdownProps,
    miw: 200,
  };

  return {
    ...(args ? objUnselect(args, ["options"]) : {}),
    w: args?.w || 160,
    icon: IconProgress,
    name: args.name || t`Status`,
    render: ({ value, data }) => {
      const color = useColor();
      const option = args.options.find((v) => v.value === value);
      if (!option) return null;

      return (
        <Group wrap="nowrap" gap={8}>
          <Card px={8} py={3} withBorder shadow="none" bg="transparent">
            <Group gap={8}>
              <Circle color={color(option.color)} size={10} />

              <Text fz={14} fw={500}>
                {option.label}
              </Text>
            </Group>
          </Card>

          {args.rightSection?.(data)}
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
              <Group gap={8}>
                <Circle color={color(v.color)} size={8} />

                <Text fz={14} fw={500}>
                  {v.label}
                </Text>
              </Group>
            );
          },
        })),
        dropdownProps,
      },
    },
    exportToExcel: (value) => {
      const option = args.options.find((v) => v.value === value);
      return {
        text: option?.label,
      };
    },
  };
}
