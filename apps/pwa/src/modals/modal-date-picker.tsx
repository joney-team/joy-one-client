import { Period } from "@/types";
import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { Card, Center, Group, Indicator, NumberInput, Stack, Text } from "@mantine/core";
import { DatePicker, DatePickerProps, DatesRangeValue } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";
import { FC, useState } from "react";
import { zIndexes } from "@joy-one-client/config/layout";

interface ModalDatePickerProps {
  period?: Period;
  onSelected?: (date: Date) => void | Promise<void>;
  onRangeSelected?: (range?: DatesRangeValue) => void | Promise<void>;
  range?: DatesRangeValue;
  clearable?: boolean;
  date?: Date;
}

const dayRenderer: DatePickerProps["renderDay"] = (date) => {
  const day = new Date(date).getDate();

  if (DateTime.isToday(date))
    return (
      <Indicator size={6} color="green" offset={-5}>
        <div>{day}</div>
      </Indicator>
    );

  return <div>{day}</div>;
};

export const ModalDatePicker: FC<ModalDatePickerProps> = (props) => {
  const [range, setRange] = useState<DatesRangeValue | undefined>(props.range);

  if (props.onRangeSelected) {
    if (props.period === Period.WEEK) {
      return (
        <Stack align="center" justify="center">
          <Card p={16} withBorder>
            <DatePicker
              type="range"
              size="md"
              allowSingleDateInRange
              renderDay={dayRenderer}
              value={range}
              onChange={(range) => {
                if (range[0]) {
                  const _range = DateTime.getStartEndOfWeek(
                    new Date(range[0]).getTime() + 1000 * 60
                  );
                  setRange([new Date(_range.start), new Date(_range.end)]);
                }
              }}
            />
          </Card>

          <Text c="gray" fz={12}>
            {t("select_week_desc")}
          </Text>

          <Group justify="center">
            <Button
              disabled={!range}
              onClick={() => {
                props.onRangeSelected?.([range![0], range![1]]);
                modals.close("date-picker");
              }}
            >
              {t("select")}
            </Button>

            {props.clearable && (
              <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  props.onRangeSelected?.(undefined);
                  modals.close("date-picker");
                }}
              >
                {t("remove")}
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    if (props.period === Period.MONTH) {
      return (
        <Stack align="center" justify="center">
          <Card p={16} withBorder>
            <DatePicker
              size="lg"
              level="year"
              monthsListFormat="MMMM"
              onMonthSelect={(e) => {
                const rangeOfMonth = DateTime.getStartEndOfMonth(new Date(e));
                props.onRangeSelected?.([new Date(rangeOfMonth.start), new Date(rangeOfMonth.end)]);
                modals.close("date-picker");
              }}
              styles={{
                monthsListControl: {
                  textTransform: "capitalize",
                },
              }}
            />
          </Card>

          <Text c="gray" fz={12}>
            {t("select_month_desc")}
          </Text>

          <Group justify="center">
            <Button
              disabled={!range}
              onClick={() => {
                props.onRangeSelected?.([range![0], range![1]]);
                modals.close("date-picker");
              }}
            >
              {t("select")}
            </Button>

            {props.clearable && (
              <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  props.onRangeSelected?.(undefined);
                  modals.close("date-picker");
                }}
              >
                {t("remove")}
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    if (props.period === Period.YEAR) {
      return (
        <Stack align="center" justify="center">
          <NumberInput
            id="year-input"
            defaultValue={
              props.date ? new Date(props.date).getFullYear() : new Date().getFullYear()
            }
            thousandSeparator={false}
          />

          <Text c="gray" fz={12}>
            {t("select_year_desc")}
          </Text>

          <Group justify="center">
            <Button
              onClick={() => {
                try {
                  const min = 1900;
                  const max = new Date().getFullYear() + 100;
                  const input = document.getElementById("year-input") as HTMLInputElement;
                  const value = +input.value;
                  if (value < min || value > max) throw new Error(t("invalid_year"));
                  const range = DateTime.getStartEndOfYear(new Date(value, 1, 0, 0, 0));
                  props.onRangeSelected?.([new Date(range.start), new Date(range.end)]);
                  modals.close("date-picker");
                } catch (error) {
                  onError(error);
                }
              }}
            >
              {t("select")}
            </Button>

            {props.clearable && (
              <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  props.onRangeSelected?.(undefined);
                  modals.close("date-picker");
                }}
              >
                {t("remove")}
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    return (
      <Stack align="center" justify="center">
        <Card p={16} withBorder>
          <DatePicker
            type="range"
            size="lg"
            allowSingleDateInRange
            renderDay={dayRenderer}
            defaultValue={props.range}
            onChange={(range) => {
              if (range[0] && range[1]) {
                setRange(range);
              } else {
                setRange(undefined);
              }
            }}
          />
        </Card>

        <Text c="gray" fz={12}>
          {t("select_date_range")}
        </Text>

        <Group justify="center">
          <Button
            disabled={!range}
            onClick={() => {
              props.onRangeSelected?.([range![0], range![1]]);
              modals.close("date-picker");
            }}
          >
            {t("select")}
          </Button>

          {props.clearable && (
            <Button
              variant="outline"
              color="gray"
              onClick={() => {
                props.onRangeSelected?.(undefined);
                modals.close("date-picker");
              }}
            >
              {t("remove")}
            </Button>
          )}
        </Group>
      </Stack>
    );
  }

  return (
    <Center>
      <Card withBorder p={16}>
        <DatePicker
          value={props.date}
          renderDay={dayRenderer}
          onChange={(date) => {
            if (date) {
              props.onSelected?.(new Date(date));
              modals.close("date-picker");
            }
          }}
          size="lg"
        />
      </Card>
    </Center>
  );
};

export const OnModalDatePicker = (props: ModalDatePickerProps) => {
  return modals.open({
    modalId: "date-picker",
    title: (
      <ModalTitle
        title={
          props.period === Period.MONTH
            ? t("select_month")
            : props.period === Period.WEEK
            ? t("select_week")
            : props.period === Period.YEAR
            ? t("select_year")
            : t("select_date")
        }
        icon={IconCalendar}
      />
    ),
    children: <ModalDatePicker {...props} />,
    yOffset: 10,
    zIndex: zIndexes.commonModals + 1,
  });
};
