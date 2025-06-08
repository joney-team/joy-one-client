import { useLang } from "@/modules/lang/lang-context";
import { DateTimeUtils, forceDate } from "@/utils/dateTime.utils";
import { DateInput as MantineDateInput, DateInputProps as MantineDateInputProps } from "@mantine/dates";
import { FC } from "react";

interface DateInputProps extends Omit<MantineDateInputProps, "value" | "onChange"> {
  value?: number | null;
  onChange?: (date: number | null) => any;
}

export const DateInput: FC<DateInputProps> = (props) => {
  const lang = useLang();

  return (
    <MantineDateInput
      {...props}
      value={forceDate(props.value)}
      valueFormat={lang.config.dateFormat}
      placeholder={lang.config.dateFormat}
      onChange={(e) => {
        props.onChange?.(e ? DateTimeUtils.timeToSeconds(e) : null);
      }}
    />
  );
};
