"use client";

import { Menu, MenuDropdown, Text } from "@mantine/core";

import { OnModalDatePicker } from "@/modals/modal-date-picker";
import { renderDate, t } from "@/modules/lang/lang-service";
import { Period } from "@/types";
import { timeToSeconds } from "@joy-one-client/utils/date-time";
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

export interface TimeRangeFilterConfig {}

export const TimeRangeFilter: FC<FilterProps<TimeRangeFilterConfig>> = ({
  colKey,
  list,
  Wrapper,
}) => {
  const filterKey = `timeRange${capitalizeFirstLetter(colKey, false)}`;
  const filterRangeKey = `range${capitalizeFirstLetter(colKey, false)}`;
  const filterValue = list.params[filterKey] || list.params[filterRangeKey] || "";
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

  const options = [
    {
      label: t("date"),
      icon: IconCalendar,
      value: Period.DATE,
      onClick: () =>
        OnModalDatePicker({
          onSelected(date) {
            if (!date) return;
            list.setParam(filterKey, `${Period.DATE}-${timeToSeconds(date)}`);
          },
        }),
    },
    {
      label: t("month"),
      icon: IconCalendarMonth,
      value: Period.MONTH,
      onClick: () =>
        OnModalDatePicker({
          period: Period.MONTH,
          onRangeSelected: (date) => {
            if (!date) return;
            list.setParam(filterKey, `${Period.MONTH}-${timeToSeconds(date[0])}`);
          },
        }),
    },
    {
      label: t("year"),
      icon: IconCalendarEvent,
      value: Period.YEAR,
      onClick: () =>
        OnModalDatePicker({
          period: Period.YEAR,
          onRangeSelected: (date) => {
            if (!date) return;
            list.setParam(filterKey, `${Period.YEAR}-${timeToSeconds(date[0])}`);
          },
        }),
    },
    {
      label: t("time_range"),
      icon: IconCalendarDot,
      value: "Range",
      onClick: () =>
        OnModalDatePicker({
          onRangeSelected: (date) => {
            if (!date) return;
            list.setParam(filterRangeKey, `${timeToSeconds(date[0])}-${timeToSeconds(date[1])}`);
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
              filterValue
                ? () => list.removeParam(filterRangeKey ? filterRangeKey : filterKey)
                : undefined
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
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            leftSection={<option.icon size={16} />}
            onClick={option.onClick}
          >
            {option.label}
          </Menu.Item>
        ))}
      </MenuDropdown>
    </Menu>
  );
};
