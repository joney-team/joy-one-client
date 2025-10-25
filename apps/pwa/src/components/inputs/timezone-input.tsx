"use client";

import { tl } from "@/modules/lang/lang-service";
import { getTimeZones } from "@/modules/times/times-service";
import { capitalize } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { Select, SelectProps } from "@mantine/core";
import { FC } from "react";

export const TimeZoneInput: FC<SelectProps> = (props) => {
  const timeZones = useFetch({
    id: "time-zones",
    fetch: async () => getTimeZones(),
  });

  return (
    <Select
      {...props}
      data={(timeZones.data || []).map((tz) => ({ label: tz.text, value: tz.id }))}
      onDropdownOpen={() => timeZones.fetch()}
      searchable
      placeholder={capitalize(`${tl("select")} ${tl("timezone")}`)}
    />
  );
};
