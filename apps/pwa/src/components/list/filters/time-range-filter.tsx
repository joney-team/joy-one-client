"use client";

import { Menu, MenuDropdown, Text } from "@mantine/core";

import { DateFormat } from "@/components/format/date-format";
import { OnModalDatePicker } from "@/modals/modal-date-picker";
import { useColor } from "@/modules/theme/use-color";
import { Period } from "@/types";
import { timeToSeconds } from "@joy-one-client/utils/date-time.legacy";
import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import { t } from "@lingui/core/macro";
import { Group } from "@mantine/core";
import {
  IconCalendar,
  IconCalendarDot,
  IconCalendarEvent,
  IconCalendarMonth,
} from "@tabler/icons-react";
import { FC, Fragment, useMemo } from "react";
import { FilterProps } from "./types";

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
    if (filterRangeValue) {
      return {
        period: Period.DATE,
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
      label: t`Date`,
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
      label: t`Month`,
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
      label: t`Year`,
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
      label: t`Time range`,
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

  const displayFilterValue = useMemo(() => {
    if (!filterValue) return null;

    if (filterRangeValue)
      return (
        <Fragment>
          <DateFormat value={fromDate} type="date" />
          {" - "}
          <DateFormat value={toDate} type="date" />
        </Fragment>
      );

    if (period === Period.DATE) {
      return <DateFormat value={fromDate} type="date" />;
    }

    if (period === Period.MONTH) {
      return (
        <DateFormat value={fromDate} type="custom" format={{ month: "2-digit", year: "2-digit" }} />
      );
    }

    if (period === Period.YEAR) {
      return <DateFormat value={fromDate} type="custom" format={{ year: "numeric" }} />;
    }
  }, [filterRangeKey, period, fromDate, toDate]);

  const onClear = () => {
    if (!filterValue) return;
    list.removeParams([filterRangeKey, filterPeriodKey]);
  };

  return (
    <Menu>
      <Menu.Target>
        <Group>
          <Wrapper onClear={onClear} active={!!filterValue}>
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
