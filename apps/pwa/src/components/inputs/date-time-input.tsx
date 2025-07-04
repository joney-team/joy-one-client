"use client";

import { ActionIcon, Group, InputWrapper, InputWrapperProps } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconChevronDown, IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import { type FC, type ReactNode, useRef } from "react";
import { DateInput } from "./date-input";

type DateTimeInputValue = number | null;

interface DateTimeInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: DateTimeInputValue;
  onChange?: (date?: DateTimeInputValue) => any;
  leftSection?: ReactNode;
}

export const DateTimeInput: FC<DateTimeInputProps> = (props) => {
  const timeInputRef = useRef<HTMLInputElement>(null);
  const { value, onChange, ...rest } = props;

  return (
    <InputWrapper {...rest}>
      <Group gap={8}>
        <DateInput
          value={value}
          onChange={(date) => {
            if (!date) return onChange?.(null);
            onChange?.(
              dayjs(date * 1000)
                .hour(0)
                .minute(0)
                .second(0)
                .unix()
            );
          }}
        />
        <TimeInput
          ref={timeInputRef}
          disabled={!value}
          leftSection={<IconClock strokeWidth={1.5} size={20} />}
          defaultValue={(function () {
            if (value) {
              const date = dayjs(value * 1000);
              return `${date.hour().toString().padStart(2, "0")}:${date
                .minute()
                .toString()
                .padStart(2, "0")}`;
            }

            return undefined;
          })()}
          onChange={(e) => {
            if (!value) return;
            const hours = parseInt(e.target.value.split(":")[0]);
            const minutes = parseInt(e.target.value.split(":")[1]);
            if (typeof hours === "undefined" || typeof minutes === "undefined") return;
            const _date = dayjs(value * 1000);
            onChange?.(dayjs(_date).hour(hours).minute(minutes).unix());
          }}
          rightSection={
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => timeInputRef.current?.showPicker()}
            >
              <IconChevronDown size={16} stroke={1.5} />
            </ActionIcon>
          }
        />
      </Group>
    </InputWrapper>
  );
};
