"use client";

import { Group } from "@mantine/core";
import { Fragment, memo, type FC } from "react";

import { useLocations } from "@/modules/locations/locations-context";
import { optionsFilter } from "@/modules/theme/generate-theme";
import { Trans } from "@lingui/react/macro";
import { Select, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

export const LocationForm: FC<{
  form: UseFormReturnType<any>;
  path?: string;
  required?: boolean;
}> = memo((props) => {
  const { form } = props;
  const { vnLocations } = useLocations();
  const path = props.path || "vnLocation";

  const input = form.getInputProps(path);

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
            form.setFieldValue(path, {
              ...(input.value ?? {}),
              provinceId: e,
              wardId: "",
            });
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
                form.values[path]?.provinceId,
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
        onChange={(e) => {
          form.setFieldValue(path, {
            ...(input.value ?? {}),
            address: e.currentTarget.value,
          });
        }}
        withAsterisk={props.required}
      />
    </Fragment>
  );
});
