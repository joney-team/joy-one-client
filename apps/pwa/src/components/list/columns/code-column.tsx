"use client";

import { Clickable } from "@/components/clickable";
import { Trans } from "@lingui/react/macro";
import { Stack, Text } from "@mantine/core";
import { IconHash } from "@tabler/icons-react";
import { Column } from "../types";

export interface CodeColumnOptions<T = any, FieldType = T[keyof T]>
  extends Omit<Column<T, FieldType>, "render"> {
  href?: (value: FieldType, data: T) => string;
  onClick?: (value: FieldType, data: T) => void;
  render?: (value: FieldType, data: T) => any;
}

export function codeColumn<T = any, FieldType = T[keyof T]>(
  options?: CodeColumnOptions<T, FieldType>
): Column<T, FieldType> {
  const { href, onClick, render, ...rest } = options || {};

  return {
    icon: IconHash,
    defaultWidth: 120,
    filter: { text: true },
    name: <Trans>Code</Trans>,
    ...rest,
    render: ({ value, data }) => {
      if (typeof value !== "string") return null;

      if (options?.onClick || options?.href) {
        return (
          <Stack gap={5} miw={0}>
            <Clickable
              onClick={options?.onClick ? () => options?.onClick?.(value, data) : undefined}
              href={options?.href ? options?.href?.(value, data) : undefined}
              fz={14}
              fw={500}
              truncate
            >
              {value}
            </Clickable>

            {render?.(value, data)}
          </Stack>
        );
      }

      return (
        <Stack gap={5} miw={0}>
          <Text fz={14} fw={500} truncate>
            {value}
          </Text>

          {render?.(value, data)}
        </Stack>
      );
    },
  };
}
