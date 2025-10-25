"use client";

import { Menu, MenuDropdown, Text } from "@mantine/core";

import { OnModalDatePicker } from "@/modals/modal-date-picker";
import { renderDate, tl } from "@/modules/lang/lang-service";
import { Period } from "@/types";
import { timeToSeconds } from "@joy-one-client/utils/date-time.legacy";
import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import { Group } from "@mantine/core";
import {
  IconCalendar,
  IconCalendarDot,
  IconCalendarEvent,
  IconCalendarMonth,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useMemo } from "react";
import { FilterProps } from "./types";
import { useColor } from "@/modules/theme/use-color";

export interface TimeRangeFilterConfig {}

export const TimeRangeFilter: FC<FilterProps<TimeRangeFilterConfig>> = ({
  colKey,
  list,
  Wrapper,
}) => {
  const color = useColor();
  const filterPeriodKey = `timeRange${capitalizeFirstLetter(colKey, false)}`;
  const filterPeriodValue = list.params[filterPeriodKey];

  const filterRangeKey = `range${capitalizeFirstLetter(colKey, false)}`;
  const filterRangeValue = list.params[filterRangeKey];

  const filterValue = filterPeriodValue ?? filterRangeValue ?? "";

  const { period, fromDate, toDate } = useMemo(() => {
    if (filterRangeKey) {
      return {
        period: Period.DATE,
        fromDate: filterValue.split("-")[0],
        toDate: filterValue.split("-")[1],
      };
    }

    return { period: Period.DATE, fromDate: filterValue };
  }, [filterValue]);

  const activatedValue = useMemo(() => {
    if (filterRangeValue) return "Range";

    if (filterValue) {
      return String(filterValue).split("-")[0];
    }
  }, [filterValue]);

  const options = [
    {
      label: tl("date"),
      icon: IconCalendar,
      value: Period.DATE,
      onClick: () =>
        OnModalDatePicker({
          onSelected(date) {
            if (!date) return;
            list.setParams({
              [filterRangeKey]: null,
              [filterPeriodKey]: `${Period.DATE}-${timeToSeconds(date)}`,
            });
          },
        }),
    },
    {
      label: tl("month"),
      icon: IconCalendarMonth,
      value: Period.MONTH,
      onClick: () =>
        OnModalDatePicker({
          period: Period.MONTH,
          onRangeSelected: (date) => {
            if (!date) return;
            list.setParams({
              [filterRangeKey]: null,
              [filterPeriodKey]: `${Period.MONTH}-${timeToSeconds(date[0])}`,
            });
          },
        }),
    },
    {
      label: tl("year"),
      icon: IconCalendarEvent,
      value: Period.YEAR,
      onClick: () =>
        OnModalDatePicker({
          period: Period.YEAR,
          onRangeSelected: (date) => {
            if (!date) return;
            list.setParams({
              [filterRangeKey]: null,
              [filterPeriodKey]: `${Period.YEAR}-${timeToSeconds(date[0])}`,
            });
          },
        }),
    },
    {
      label: tl("time_range"),
      icon: IconCalendarDot,
      value: "Range",
      onClick: () =>
        OnModalDatePicker({
          onRangeSelected: (date) => {
            if (!date) return;
            list.setParams({
              [filterPeriodKey]: null,
              [filterRangeKey]: `${timeToSeconds(date[0])}-${timeToSeconds(date[1])}`,
            });
          },
        }),
    },
  ];

  return (
    <Menu>
      <Menu.Target>
        <Group>
          <Wrapper
            onClear={
              filterValue ? () => list.removeParams([filterRangeValue, filterPeriodKey]) : undefined
            }
            active={!!filterValue}
          >
            {filterValue && (
              <Text fz={12} fw={700}>
                {(function () {
                  if (filterRangeKey)
                    return `${renderDate(+fromDate * 1000)} - ${renderDate(+toDate * 1000)}`;
                  if (period === Period.DATE) return renderDate(+fromDate * 1000);
                  if (period === Period.MONTH)
                    return capitalizeFirstLetter(dayjs(+fromDate * 1000).format(`MMMM YYYY`));
                  if (period === Period.YEAR) return dayjs(+fromDate * 1000).format(`YYYY`);
                })()}
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
