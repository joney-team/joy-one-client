import { Menu, MenuDropdown, Text } from "@mantine/core";

import { Period } from "@joy-one-client/apis/types/general";
import { timeToSeconds } from "@joy-one-client/utils/date-time";
import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import { Group } from "@mantine/core";
import { IconCalendar, IconCalendarEvent, IconCalendarMonth } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC } from "react";
import { FilterProps } from "./types";
import { renderDate, t } from "@/modules/lang/lang-service";
import { OnModalDatePicker } from "@/modals/modal-date-picker";

export interface TimeRangeFilterConfig {}

export const TimeRangeFilter: FC<FilterProps<TimeRangeFilterConfig>> = ({ colKey, list, Wrapper }) => {
  const filterKey = `timeRange${capitalizeFirstLetter(colKey)}`;
  const filterValue = list.query[filterKey] || "";
  const [period, date] = filterValue.split("-");

  const options = [
    {
      label: t("date"),
      icon: IconCalendar,
      value: Period.DATE,
      onClick: () =>
        OnModalDatePicker({
          onSelected(date) {
            if (!date) return;
            list.setQuery(filterKey, `${Period.DATE}-${timeToSeconds(date)}`);
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
            list.setQuery(filterKey, `${Period.MONTH}-${timeToSeconds(date[0])}`);
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
            list.setQuery(filterKey, `${Period.YEAR}-${timeToSeconds(date[0])}`);
          },
        }),
    },
  ];

  return (
    <Menu>
      <Menu.Target>
        <Group>
          <Wrapper onClear={filterValue ? () => list.removeQuery(filterKey) : undefined} active={!!filterValue}>
            {filterValue && (
              <>
                <Text fz={12} fw={700}>
                  {(function () {
                    if (period === Period.DATE) return renderDate(+date * 1000);
                    if (period === Period.MONTH) return capitalizeFirstLetter(dayjs(+date * 1000).format(`MMMM YYYY`));
                    if (period === Period.YEAR) return dayjs(+date * 1000).format(`YYYY`);
                  })()}
                </Text>
              </>
            )}
          </Wrapper>
        </Group>
      </Menu.Target>

      <MenuDropdown>
        {options.map((option) => (
          <Menu.Item key={option.value} leftSection={<option.icon size={16} />} onClick={option.onClick}>
            {option.label}
          </Menu.Item>
        ))}
      </MenuDropdown>
    </Menu>
  );
};
