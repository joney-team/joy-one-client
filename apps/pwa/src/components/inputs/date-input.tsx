"use client";

import { type FC, type ReactNode } from "react";
import { getDateFormat } from "@/modules/lang/lang-service";
import { DateTimeUtils, forceDate } from "@/utils/dateTime.utils";
import {
  DateInput as MantineDateInput,
  DateInputProps as MantineDateInputProps,
} from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";

interface DateInputProps
  extends Omit<MantineDateInputProps, "value" | "onChange" | "defaultValue"> {
  value?: number | null;
  onChange?: (date?: number | null) => any;
  defaultValue?: number | null;
  leftSection?: ReactNode;
}

export const DateInput: FC<DateInputProps> = (props) => {
  const { value, onChange, ...rest } = props;

  return (
    <MantineDateInput
      {...rest}
      leftSection={rest.leftSection || <IconCalendar strokeWidth={1.5} size={20} />}
      defaultValue={forceDate(props.defaultValue)}
      value={forceDate(value)}
      valueFormat={getDateFormat()}
      placeholder={getDateFormat()}
      onChange={(e) => {
        if (!e) return onChange?.(null);
        onChange?.(DateTimeUtils.timeToSeconds(e));
      }}
      clearable
    />
  );
};
