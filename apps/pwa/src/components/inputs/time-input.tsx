"use client";

import { DateTime } from "@joy-one/utils/date-time";
import { ActionIcon } from "@mantine/core";
import {
  TimeInput as MantineTimeInput,
  TimeInputProps as MantineTimeInputProps,
} from "@mantine/dates";
import { IconClock } from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";

export interface TimeInputProps
  extends Omit<
    MantineTimeInputProps,
    "defaultValue" | "onChange" | "value" | "ref" | "rightSection"
  > {
  value?: Date;
  defaultValue?: Date;
  onChange?: (time: [number, number]) => any;
}

export const TimeInput: FC<TimeInputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const { value, onChange, defaultValue, ...rest } = props;

  const ref = useRef<HTMLInputElement>(null);

  const pickerControl = (
    <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  useEffect(() => {
    if (!isFocused && props.value && ref.current) {
      ref.current.value = DateTime.toTimeInputValue(props.value);
    }
  }, [props.value, isFocused, ref]);

  return (
    <MantineTimeInput
      {...rest}
      ref={ref}
      onFocus={(e) => {
        rest.onFocus?.(e);
        setIsFocused(true);
      }}
      onBlur={(e) => {
        rest.onBlur?.(e);
        setIsFocused(false);
      }}
      rightSection={pickerControl}
      defaultValue={
        value || defaultValue ? DateTime.toTimeInputValue(value || defaultValue) : undefined
      }
      onChange={(value) => {
        const [hour, minute] = value.target.value.split(":");
        onChange?.([+hour, +minute]);
      }}
    />
  );
};
