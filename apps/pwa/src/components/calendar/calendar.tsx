"use client";

import { useColor } from "@/modules/theme/use-color";
import { CalendarView } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconCalendarDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { FC, useMemo, useState } from "react";
import { Button } from "../buttons/button";
import { CalendarViewSelector } from "../calendar-view-selector";
import { DateFormat } from "../format/date-format";
import { LaunchingSoon } from "../launching-soon";
import { CalendarMonthView } from "./calendar-month-view";
import { CalendarProps, CalendarViewProps } from "./calendar-types";
import { normalizeCalendarView } from "./calendar-utils";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";

const calendarViews: Record<
  CalendarView,
  {
    component?: FC<CalendarViewProps> | undefined;
    recentLabel: MacroMessageDescriptor;
  }
> = {
  [CalendarView.DAY]: {
    recentLabel: defineMessage`Today`,
  },
  [CalendarView.WEEK]: {
    recentLabel: defineMessage`Current week`,
  },
  [CalendarView.MONTH]: {
    component: CalendarMonthView,
    recentLabel: defineMessage`Current month`,
  },
};

export const Calendar: FC<CalendarProps> = (props) => {
  const color = useColor();
  const { t } = useLingui();
  const [date, setDate] = useState<Date>(props.initialDate || new Date());
  const view = useMemo(() => {
    return normalizeCalendarView(props.view);
  }, [props.view]);

  const range = DateTime.getRange(date, view);

  const nextRange = () => {
    const nextDate = DateTime.add(date, view, 1);
    setDate(nextDate);

    const nextRange = DateTime.getRange(nextDate, view);
    props.onChange?.(nextRange);
  };

  const previousRange = () => {
    const previousDate = DateTime.subtract(date, view, 1);
    setDate(previousDate);
    const previousRange = DateTime.getRange(previousDate, view);
    props.onChange?.(previousRange);
  };

  const goToday = () => {
    setDate(new Date());
    props.onChange?.({ start: new Date(), end: new Date() });
  };

  const calendarRange = {
    [CalendarView.DAY]: (
      <Group gap={3}>
        <Text tt="capitalize" fw={600} fz={16}>
          <DateFormat value={date} type="custom" format={{ weekday: "long" }} />
        </Text>
        <Text fw={300} fz={16}>
          <DateFormat value={date} type="date" />
        </Text>
      </Group>
    ),
    [CalendarView.WEEK]: (
      <Group gap={3}>
        <Text tt="capitalize" fz={16}>
          <DateFormat value={range.start} type="date" />
        </Text>
        <Text fz={16}>-</Text>
        <Text fz={16}>
          <DateFormat value={range.end} type="date" />
        </Text>
      </Group>
    ),
    [CalendarView.MONTH]: (
      <Group gap={3}>
        <Text tt="capitalize" fw={600} fz={16}>
          <DateFormat value={date} type="custom" format={{ month: "long" }} />
        </Text>
        <Text fw={300} fz={16}>
          <DateFormat value={date} type="custom" format={{ year: "numeric" }} />
        </Text>
      </Group>
    ),
  };

  const calendarView = useMemo(() => {
    const Component = calendarViews[view]?.component;
    if (!Component) return <LaunchingSoon shadow="none" />;

    return (
      <Component
        startAt={range.start}
        endAt={range.end}
        renderDay={props.renderDay}
        renderDayHead={props.renderDayHead}
        daySlotMinHeight={props.daySlotMinHeight}
        components={props.components}
      />
    );
  }, [view, range, props.renderDay, props.renderDayHead, props.components, props.daySlotMinHeight]);

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <Group gap={5}>
            <ActionIcon variant="outline" color={color("gray")} size="sm" onClick={previousRange}>
              <IconChevronLeft strokeWidth={1.5} size={18} />
            </ActionIcon>

            <ActionIcon variant="outline" color={color("gray")} size="sm" onClick={nextRange}>
              <IconChevronRight strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>

          {calendarRange[view]}

          {props.head}
        </Group>

        <Group gap={5}>
          {!DateTime.isSame(date, new Date(), view) && (
            <Button size="compact-sm" leftIcon={IconCalendarDown} variant="light" onClick={goToday}>
              {calendarViews[view] ? t(calendarViews[view]?.recentLabel) : <Trans>Today</Trans>}
            </Button>
          )}

          <CalendarViewSelector view={view} onChange={(v) => props.onViewChange?.(v)} />
        </Group>
      </Group>

      {calendarView}
    </Stack>
  );
};
