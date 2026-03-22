"use client";

import { useLang } from "@/modules/lang/lang-context";
import { DateTime, RawDate } from "@joy-one-client/utils/date-time";
import {
  DateInput as MantineDateInput,
  DateInputProps as MantineDateInputProps,
} from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { type FC, type ReactNode } from "react";

interface DateInputProps extends Omit<
  MantineDateInputProps,
  "value" | "onChange" | "defaultValue"
> {
  value?: RawDate | null;
  onChange?: (date?: number | null) => any;
  defaultValue?: RawDate | null;
  leftSection?: ReactNode;
}

export const DateInput: FC<DateInputProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const lang = useLang();

  return (
    <MantineDateInput
      {...rest}
      leftSection={rest.leftSection || <IconCalendar strokeWidth={1.5} size={20} />}
      defaultValue={props.defaultValue ? DateTime.normalizeDate(props.defaultValue) : undefined}
      value={value ? DateTime.normalizeDate(value) : undefined}
      valueFormat={DateTime.getDateFormatString(lang.locale)}
      placeholder={DateTime.getDateFormatString(lang.locale)}
      onChange={(e) => {
        if (!e) return onChange?.(null);
        onChange?.(DateTime.toSeconds(e));
      }}
      clearable={props.clearable ?? true}
    />
  );
};
