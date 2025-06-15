"use client";

import { type FC } from "react";
import { getDateFormat } from "@/modules/lang/lang-service";
import { DateTimeUtils, forceDate } from "@/utils/dateTime.utils";
import {
  DateInput as MantineDateInput,
  DateInputProps as MantineDateInputProps,
} from "@mantine/dates";

interface DateInputProps extends Omit<MantineDateInputProps, "value" | "onChange"> {
  value?: number | null;
  onChange?: (date: number | null) => any;
}

export const DateInput: FC<DateInputProps> = (props) => {
  return (
    <MantineDateInput
      {...props}
      value={forceDate(props.value)}
      valueFormat={getDateFormat()}
      placeholder={getDateFormat()}
      onChange={(e) => {
        props.onChange?.(e ? DateTimeUtils.timeToSeconds(e) : null);
      }}
    />
  );
};
