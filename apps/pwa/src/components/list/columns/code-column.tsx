import { Clickable } from "@/components/clickable";
import { Stack, Text } from "@mantine/core";
import { IconHash } from "@tabler/icons-react";
import { Column } from "../types";
import { t } from "@lingui/core/macro";

export interface CodeColumnOptions<T = any, FieldType = T[keyof T]>
  extends Omit<Column<T, FieldType>, "render"> {
  href?: (value: FieldType, data: T) => string;
  onClick?: (value: FieldType, data: T) => void;
  render?: (value: FieldType, data: T) => any;
}

export function CodeColumn<T = any, FieldType = T[keyof T]>(
  options?: CodeColumnOptions<T, FieldType>
): Column<T, FieldType> {
  const { href, onClick, render, ...rest } = options || {};

  return {
    ...rest,
    w: options?.w || 100,
    name: rest.name || t`Code`,
    icon: options?.icon || IconHash,
    filter: options?.filter || { text: true },
    render: ({ value, data }) => {
      if (typeof value !== "string") return null;

      if (options?.onClick) {
        return (
          <Stack gap={5}>
            <Clickable
              c="var(--mantine-color-text)"
              onClick={() => options.onClick?.(value, data)}
              fz={14}
              fw={500}
            >
              {value}
            </Clickable>
            {render?.(value, data)}
          </Stack>
        );
      }

      if (options?.href) {
        return (
          <Stack gap={5}>
            <Clickable
              c="var(--mantine-color-text)"
              href={options.href(value, data)}
              fz={14}
              fw={500}
            >
              {value}
            </Clickable>
            {render?.(value, data)}
          </Stack>
        );
      }

      return (
        <Stack gap={5}>
          <Text fz={14} fw={500}>
            {value}
          </Text>
          {render?.(value, data)}
        </Stack>
      );
    },
  };
}
