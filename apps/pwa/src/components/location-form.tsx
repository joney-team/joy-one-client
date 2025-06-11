import { TextInput } from "@/components/inputs/text-input";
import { Group } from "@mantine/core";
import { Fragment, memo, type FC } from "react";

import { t } from "@/modules/lang/lang-service";
import { useLocations } from "@/modules/locations/locations-service";
import { optionsFilter } from "@/modules/theme/generator";
import { Select } from "@mantine/core";

export const LocationForm: FC<{
  form: any;
  path?: string;
  required?: boolean;
}> = memo((props) => {
  const { form } = props;
  const [locations] = useLocations();
  const path = props.path || "location";

  return (
    <Fragment>
      <Select
        label={t("province")}
        {...form.getInputProps(`${path}.provinceId`)}
        searchable
        data={locations
          .filter((l) => l.type === "province")
          .map((l) => ({ value: l.id, label: l.name }))}
        onChange={(e) => {
          form.setFieldValue(`${path}.provinceId`, e!);
          form.setFieldValue(`${path}.districtId`, "");
          form.setFieldValue(`${path}.wardId`, "");
        }}
        filter={optionsFilter}
        withAsterisk={props.required}
      />

      <Group wrap="nowrap">
        <Select
          label={t("district")}
          {...form.getInputProps(`${path}.districtId`)}
          searchable
          data={locations
            .filter((l) => l.type === "district" && l.parentId === form.values[path]?.provinceId)
            .map((l) => ({ value: l.id, label: l.fullName }))}
          onChange={(e) => {
            form.setFieldValue(`${path}.districtId`, e!);
            form.setFieldValue(`${path}.wardId`, "");
          }}
          flex={1}
          filter={optionsFilter}
          withAsterisk={props.required}
        />

        <Select
          label={t("ward")}
          {...form.getInputProps(`${path}.wardId`)}
          searchable
          data={locations
            .filter((l) => l.type === "ward" && l.parentId === form.values[path]?.districtId)
            .map((l) => ({ value: l.id, label: l.fullName }))}
          flex={1}
          filter={optionsFilter}
          withAsterisk={props.required}
        />
      </Group>

      <TextInput
        label={t("address")}
        {...form.getInputProps(`${path}.address`)}
        withAsterisk={props.required}
      />
    </Fragment>
  );
});
