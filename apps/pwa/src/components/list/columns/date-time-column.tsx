"use client";

import { DateFormat } from "@/components/format/date-format";
import { getClientLocale } from "@/modules/lang/lang-service";
import { DateTime } from "@joy-one/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { Column } from "../types";

export interface DateTimeColumnArgs extends Omit<Column, "render"> {
  emptyText?: string;
  hideTime?: boolean;
  isShowRelativeTime?: boolean;
  isHasFilter?: boolean;
}

export const dateTimeColumn = (args?: DateTimeColumnArgs): Column => {
  return {
    defaultWidth: 180,
    icon: IconClock,
    name: <Trans>Time</Trans>,
    exportToExcel: (value) => {
      return {
        date: value,
      };
    },
    filter: args?.isHasFilter
      ? {
          timeRange: {},
        }
      : undefined,
    ...args,
    render: ({ value }) => {
      if (!value || !DateTime.isValid(value)) return args?.emptyText || "-";
      const locale = getClientLocale();

      return (
        <Stack gap={0}>
          <Text c="var(--mantine-color-text)">
            <DateFormat value={value} type="date" />
          </Text>

          {!args?.hideTime && (
            <Group gap={3}>
              <ThemeIcon variant="transparent" color="var(--mantine-color-dimmed)" size="xs">
                <IconClock strokeWidth={1.5} />
              </ThemeIcon>
              <Text fz={14} c="var(--mantine-color-dimmed)">
                <DateFormat value={value} type="time" />
              </Text>
            </Group>
          )}

          {args?.isShowRelativeTime && (
            <Text fz={10} c="var(--mantine-color-dimmed)">
              {DateTime.formatRelative(value, locale)}
            </Text>
          )}
        </Stack>
      );
    },
  };
};
