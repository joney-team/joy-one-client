"use client";

import { Menu, MenuDropdown, Text } from "@mantine/core";

import { DateFormat } from "@/components/format/date-format";
import { OnModalDatePicker } from "@/modals/modal-date-picker";
import { useColor } from "@/modules/theme/use-color";
import { DateTime } from "@joy-one/utils/date-time";
import { capitalizeFirstLetter } from "@joy-one/utils/string";
import { Trans } from "@lingui/react/macro";
import { Group } from "@mantine/core";
import {
  IconCalendar,
  IconCalendarDot,
  IconCalendarEvent,
  IconCalendarMonth,
} from "@tabler/icons-react";
import { FC, Fragment, useMemo, useState } from "react";
import { useListContext } from "../list-context";
import { FilterProps } from "./types";
import { Period } from "@/graphql/enums.graphql";

export interface TimeRangeFilterConfig {}

export const TimeRangeFilter: FC<FilterProps> = ({ column, wrapper: Wrapper }) => {
  const { list } = useListContext();
  const [opened, setOpened] = useState(false);
  const color = useColor();
  const filterPeriodKey = `timeRange${capitalizeFirstLetter(column.columnKey, false)}`;
  const filterPeriodValue = list.params[filterPeriodKey];

  const filterRangeKey = `range${capitalizeFirstLetter(column.columnKey, false)}`;
  const filterRangeValue = list.params[filterRangeKey];

  const filterValue = String(filterPeriodValue ?? filterRangeValue ?? "");

  const { period, fromDate, toDate } = useMemo(() => {
    if (filterRangeValue) {
      return {
        period: Period.Date,
        fromDate: filterValue.split("-")[0],
        toDate: filterValue.split("-")[1],
      };
    }

    return { period: filterValue.split("-")[0], fromDate: filterValue.split("-")[1] };
  }, [filterValue]);

  const activatedValue = useMemo(() => {
    if (filterRangeValue) return "Range";

    if (filterValue) {
      return String(filterValue).split("-")[0];
    }
  }, [filterValue]);

  const options = [
    {
      label: <Trans>Date</Trans>,
      icon: IconCalendar,
      value: Period.Date,
      onClick: () =>
        OnModalDatePicker({
          onSelected(date) {
            if (!date) return;
            list.setParams({
              [filterRangeKey]: null,
              [filterPeriodKey]: `${Period.Date}-${DateTime.toSeconds(date)}`,
            });
          },
        }),
    },
    {
      label: <Trans>Month</Trans>,
      icon: IconCalendarMonth,
      value: Period.Month,
      onClick: () =>
        OnModalDatePicker({
          period: Period.Month,
          onRangeSelected: (date) => {
            if (!date || !date[0]) return;
            list.setParams({
              [filterRangeKey]: null,
              [filterPeriodKey]: `${Period.Month}-${DateTime.toSeconds(date[0])}`,
            });
          },
        }),
    },
    {
      label: <Trans>Year</Trans>,
      icon: IconCalendarEvent,
      value: Period.Year,
      onClick: () =>
        OnModalDatePicker({
          period: Period.Year,
          onRangeSelected: (date) => {
            if (!date || !date[0]) return;
            list.setParams({
              [filterRangeKey]: null,
              [filterPeriodKey]: `${Period.Year}-${DateTime.toSeconds(date[0])}`,
            });
          },
        }),
    },
    {
      label: <Trans>Time range</Trans>,
      icon: IconCalendarDot,
      value: "Range",
      onClick: () =>
        OnModalDatePicker({
          onRangeSelected: (date) => {
            if (!date || !date[0] || !date[1]) return;
            list.setParams({
              [filterPeriodKey]: null,
              [filterRangeKey]: `${DateTime.toSeconds(date[0])}-${DateTime.toSeconds(date[1])}`,
            });
          },
        }),
    },
  ];

  const displayFilterValue = useMemo(() => {
    if (!filterValue) return null;

    if (filterRangeValue && fromDate && toDate)
      return (
        <Fragment>
          <DateFormat value={fromDate} type="date" />
          {" - "}
          <DateFormat value={toDate} type="date" />
        </Fragment>
      );

    if (period === Period.Date) {
      return <DateFormat value={fromDate} type="date" />;
    }

    if (period === Period.Month) {
      return (
        <DateFormat value={fromDate} type="custom" format={{ month: "2-digit", year: "2-digit" }} />
      );
    }

    if (period === Period.Year) {
      return <DateFormat value={fromDate} type="custom" format={{ year: "numeric" }} />;
    }
  }, [filterRangeKey, period, fromDate, toDate]);

  const onClear = () => {
    if (!filterValue) return;
    list.removeParams([filterRangeKey, filterPeriodKey]);
  };

  return (
    <Menu opened={opened} onClose={() => setOpened(false)} onDismiss={() => setOpened(false)}>
      <Menu.Target>
        <Group flex={1}>
          <Wrapper
            onClick={() => setOpened(true)}
            onClear={onClear}
            active={filterValue.length > 0}
            selectedContent={
              <span style={{ textTransform: "capitalize" }}>{displayFilterValue}</span>
            }
          >
            {displayFilterValue && (
              <Text fz={12} fw={700} tt="capitalize">
                {displayFilterValue}
              </Text>
            )}
          </Wrapper>
        </Group>
      </Menu.Target>

      <MenuDropdown>
        {options.map((option) => {
          const isActive = activatedValue === option.value;

          return (
            <Menu.Item
              key={option.value}
              onClick={option.onClick}
              leftSection={
                <option.icon size={16} color={isActive ? color("primary") : undefined} />
              }
            >
              {option.label}
            </Menu.Item>
          );
        })}
      </MenuDropdown>
    </Menu>
  );
};
