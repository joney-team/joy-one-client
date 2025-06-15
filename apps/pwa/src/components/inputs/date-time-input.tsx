"use client";

import { DateTimeUtils } from "@/utils/dateTime.utils";
import { ActionIcon, Group, InputWrapper, InputWrapperProps, Stack } from "@mantine/core";
import { Calendar, TimeInput } from "@mantine/dates";
import { IconCheck, IconClock } from "@tabler/icons-react";
import { FC, useState } from "react";

interface DateTimeInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: any;
  onChange?: (date?: number) => any;
  isSeconds?: boolean;
}

export const DateTimeInput: FC<DateTimeInputProps> = (props) => {
  const isSeconds = typeof props.value === "number" && props.value.toString().length === 10;
  const [date, setDate] = useState<Date | undefined>(
    isSeconds ? new Date(props.value * 1000) : props.value || undefined
  );

  let _props = { ...props } as any;
  delete _props.onChange;
  delete _props.value;

  const onSubmit = () => {
    if (!date) return props.onChange?.(undefined);
    if (isSeconds || props.isSeconds) props.onChange?.(DateTimeUtils.timeToSeconds(date));
    else props.onChange?.(date.getTime());
  };

  return (
    <InputWrapper {..._props}>
      <Stack gap={10} p={0}>
        <Calendar
          defaultDate={date}
          getDayProps={(_date) => {
            return {
              selected: !!date && DateTimeUtils.isMatchDay(_date, date),
              onClick: () => {
                const temp = new Date(_date);
                temp.setHours(date?.getHours() || 0);
                temp.setMinutes(date?.getMinutes() || 0);
                setDate(temp);
              },
            };
          }}
        />
        <Group gap={8}>
          <TimeInput
            leftSection={<IconClock strokeWidth={1.5} size={20} />}
            flex={1}
            defaultValue={(function () {
              if (date)
                return `${date.getHours().toString().padStart(2, "0")}:${date
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;
              return undefined;
            })()}
            onChange={(e) => {
              if (!date) return;

              const _date = new Date(date);
              const hours = parseInt(e.target.value.split(":")[0]);
              const minutes = parseInt(e.target.value.split(":")[1]);
              if (typeof hours === "undefined" || typeof minutes === "undefined") return;
              _date.setHours(parseInt(e.target.value.split(":")[0]));
              _date.setMinutes(parseInt(e.target.value.split(":")[1]));
              setDate(_date);
            }}
          />

          <ActionIcon size="lg" onClick={() => onSubmit()}>
            <IconCheck />
          </ActionIcon>
        </Group>
      </Stack>
    </InputWrapper>
  );
};
