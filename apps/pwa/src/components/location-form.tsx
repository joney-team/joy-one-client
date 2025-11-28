"use client";

import { Group } from "@mantine/core";
import { Fragment, memo, type FC } from "react";

import { useLocations } from "@/modules/locations/locations-context";
import { optionsFilter } from "@/modules/theme/generate-theme";
import { Trans } from "@lingui/react/macro";
import { Select, TextInput } from "@mantine/core";

export const LocationForm: FC<{
  form: any;
  path?: string;
  required?: boolean;
}> = memo((props) => {
  const { form } = props;
  const { vnLocations } = useLocations();
  const path = props.path || "vnLocation";

  return (
    <Fragment>
      <Group wrap="nowrap">
        <Select
          label={<Trans>Province</Trans>}
          {...form.getInputProps(`${path}.provinceId`)}
          searchable
          data={vnLocations
            .filter((l) => l.type === "province")
            .map((l) => ({ value: l.id, label: l.name }))}
          onChange={(e) => {
            form.setFieldValue(`${path}.provinceId`, e!);
            form.setFieldValue(`${path}.wardId`, "");
          }}
          filter={optionsFilter}
          withAsterisk={props.required}
        />
        <Select
          label={<Trans>Ward</Trans>}
          {...form.getInputProps(`${path}.wardId`)}
          searchable
          data={vnLocations
            .filter(
              (l) =>
                l.type === "ward" &&
                l.parentId === form.values[path]?.provinceId &&
                form.values[path]?.provinceId
            )
            .map((l) => ({ value: l.id, label: l.fullName }))}
          flex={1}
          filter={optionsFilter}
          withAsterisk={props.required}
        />
      </Group>

      <TextInput
        label={<Trans>Address</Trans>}
        {...form.getInputProps(`${path}.address`)}
        withAsterisk={props.required}
      />
    </Fragment>
  );
});
