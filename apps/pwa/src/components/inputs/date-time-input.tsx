"use client";

import { DateTime } from "@joy-one/utils/date-time";
import { ActionIcon, Group, InputWrapper, InputWrapperProps } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconChevronDown, IconClock } from "@tabler/icons-react";
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
            const output = DateTime.toSeconds(
              new Date(DateTime.normalizeDate(date).setHours(0, 0, 0, 0))
            );

            onChange?.(output);
          }}
        />
        <TimeInput
          ref={timeInputRef}
          disabled={!value}
          leftSection={<IconClock strokeWidth={1.5} size={20} />}
          defaultValue={(function () {
            if (value) {
              const date = DateTime.normalizeDate(value);
              return `${date.getHours().toString().padStart(2, "0")}:${date
                .getMinutes()
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
            const _date = DateTime.normalizeDate(value);
            onChange?.(DateTime.toSeconds(new Date(_date).setHours(hours, minutes, 0, 0)));
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
