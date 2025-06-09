import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import { renderDate, renderTime } from "@/modules/lang/lang-service";
import { Column } from "../types";

export interface DateTimeColumnArgs extends Omit<Column, "render"> {
  emptyText?: string;
  hideTime?: boolean;
  isFromNow?: boolean;
  isHasFilter?: boolean;
}

export const DateTimeColumn = (args?: DateTimeColumnArgs): Column => {
  return {
    ...args,
    icon: args?.icon || IconClock,
    name: args?.name || "time",
    w: args?.w || 150,
    render: ({ value }) => {
      if (!value) return args?.emptyText || "-";
      return (
        <Stack gap={0}>
          <Text c="var(--mantine-color-text)">{renderDate(value)}</Text>
          {!args?.hideTime && (
            <Group gap={3}>
              <ThemeIcon variant="transparent" color="var(--mantine-color-dimmed)" size="xs">
                <IconClock strokeWidth={1.5} />
              </ThemeIcon>
              <Text fz={14} c="var(--mantine-color-dimmed)">
                {renderTime(value)}
              </Text>
            </Group>
          )}

          {args?.isFromNow && (
            <Text fz={10} c="var(--mantine-color-dimmed)">
              {dayjs(value * 1000).fromNow()}
            </Text>
          )}
        </Stack>
      );
    },
    filter: args?.isHasFilter
      ? {
          timeRange: {},
        }
      : undefined,
    exportToExcel: (value) => {
      return {
        date: value,
      };
    },
  };
};
