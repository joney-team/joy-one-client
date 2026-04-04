"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { Period } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Card, Center, Group, Indicator, NumberInput, Stack, Text } from "@mantine/core";
import { DatePicker, DatePickerProps, DatesRangeValue } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { IconCalendar } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ModalDatePickerProps {
  period?: string;
  onSelected?: (date: Date) => void | Promise<void>;
  onRangeSelected?: (range?: DatesRangeValue) => void | Promise<void>;
  range?: DatesRangeValue;
  clearable?: boolean;
  date?: Date;
}

const dayRenderer: DatePickerProps["renderDay"] = (date) => {
  const day = new Date(date).getDate();

  if (DateTime.isSame(date, new Date(), "day"))
    return (
      <Indicator size={6} color="green" offset={-5}>
        <div>{day}</div>
      </Indicator>
    );

  return <div>{day}</div>;
};

export const ModalDatePicker: FC<ModalDatePickerProps> = (props) => {
  const [range, setRange] = useState<DatesRangeValue | undefined>(props.range);
  const { t } = useLingui();

  if (props.onRangeSelected) {
    if (props.period === Period.WEEK) {
      return (
        <Stack align="center" justify="center">
          <Card p="md" withBorder>
            <DatePicker
              type="range"
              size="md"
              allowSingleDateInRange
              renderDay={dayRenderer}
              value={range}
              onChange={(range) => {
                if (range[0]) {
                  const _range = DateTime.getRange(
                    new Date(range[0]).getTime() + 1000 * 60,
                    "week",
                  );
                  setRange([new Date(_range.start), new Date(_range.end)]);
                }
              }}
            />
          </Card>

          <Text c="gray" fz={12}>
            <Trans>Select the week you want to view</Trans>
          </Text>

          <Group justify="center">
            <Button
              disabled={!range}
              onClick={() => {
                props.onRangeSelected?.([range![0], range![1]]);
                modals.close("date-picker");
              }}
            >
              <Trans>Select</Trans>
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
                <Trans>Remove</Trans>
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    if (props.period === Period.MONTH) {
      return (
        <Stack align="center" justify="center">
          <Card p="md" withBorder>
            <DatePicker
              size="lg"
              level="year"
              monthsListFormat="MMMM"
              onMonthSelect={(e) => {
                const rangeOfMonth = DateTime.getRange(new Date(e), "month");
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
            <Trans>Select the month you want to view</Trans>
          </Text>

          <Group justify="center">
            <Button
              disabled={!range}
              onClick={() => {
                props.onRangeSelected?.([range![0], range![1]]);
                modals.close("date-picker");
              }}
            >
              <Trans>Select</Trans>
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
                <Trans>Remove</Trans>
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
            <Trans>Select the year you want to view</Trans>
          </Text>

          <Group justify="center">
            <Button
              onClick={() => {
                try {
                  const min = 1900;
                  const max = new Date().getFullYear() + 100;
                  const input = document.getElementById("year-input") as HTMLInputElement;
                  const value = +input.value;
                  if (value < min || value > max) throw new Error(t`Invalid year`);
                  const range = DateTime.getRange(new Date(value, 1, 0, 0, 0), "year");
                  props.onRangeSelected?.([new Date(range.start), new Date(range.end)]);
                  modals.close("date-picker");
                } catch (error) {
                  onError(error);
                }
              }}
            >
              <Trans>Select</Trans>
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
                <Trans>Remove</Trans>
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    return (
      <Stack align="center" justify="center">
        <Card p="md" withBorder>
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
          <Trans>Select the date range you want to view</Trans>
        </Text>

        <Group justify="center">
          <Button
            disabled={!range}
            onClick={() => {
              props.onRangeSelected?.([range![0], range![1]]);
              modals.close("date-picker");
            }}
          >
            <Trans>Select</Trans>
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
              <Trans>Remove</Trans>
            </Button>
          )}
        </Group>
      </Stack>
    );
  }

  return (
    <Center>
      <Card withBorder p="md">
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
      <ModalHead
        name={
          props.period === Period.MONTH ? (
            <Trans>Select month</Trans>
          ) : props.period === Period.WEEK ? (
            <Trans>Select week</Trans>
          ) : props.period === Period.YEAR ? (
            <Trans>Select year</Trans>
          ) : (
            <Trans>Select date</Trans>
          )
        }
        icon={IconCalendar}
      />
    ),
    children: <ModalDatePicker {...props} />,
    yOffset: 10,
    zIndex: zIndexes.commonModals + 1,
  });
};
