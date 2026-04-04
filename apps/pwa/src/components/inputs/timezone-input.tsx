"use client";

import GetTimeZonesDocument from "@/modules/times/graphql/getTimeZones.graphql";
import { useQuery } from "@apollo/client/react";
import { useLingui } from "@lingui/react/macro";
import { Select, SelectProps } from "@mantine/core";
import { FC } from "react";

export const TimeZoneInput: FC<SelectProps> = (props) => {
  const { t } = useLingui();

  const { data } = useQuery(GetTimeZonesDocument);

  return (
    <Select
      {...props}
      data={(data?.timeZones || []).map((tz) => ({ label: tz.text, value: tz.id }))}
      searchable
      placeholder={t`Select timezone`}
    />
  );
};
