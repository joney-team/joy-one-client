import { getClientLocale } from "@/modules/lang/lang-service";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { Column } from "../types";
import { t } from "@lingui/core/macro";

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
    name: args?.name || t`Time`,
    w: args?.w || 150,
    render: ({ value }) => {
      if (!value || !DateTime.isValid(value)) return args?.emptyText || "-";
      const locale = getClientLocale();

      return (
        <Stack gap={0}>
          <Text c="var(--mantine-color-text)">{DateTime.formatDate(value, { locale })}</Text>
          {!args?.hideTime && (
            <Group gap={3}>
              <ThemeIcon variant="transparent" color="var(--mantine-color-dimmed)" size="xs">
                <IconClock strokeWidth={1.5} />
              </ThemeIcon>
              <Text fz={14} c="var(--mantine-color-dimmed)">
                {DateTime.formatTime(value, { locale })}
              </Text>
            </Group>
          )}

          {args?.isFromNow && (
            <Text fz={10} c="var(--mantine-color-dimmed)">
              {DateTime.fromNow(value)}
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
