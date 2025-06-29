import { Group, InputWrapper, Switch } from "@mantine/core";
import { FC } from "react";
import { CustomFieldInputProps } from "../components/builder-custom-fields";
import { t } from "@/modules/lang/lang-service";

export const CustomFieldSwitchInput: FC<CustomFieldInputProps> = (props) => {
  return (
    <InputWrapper label={props.customField.label} description={props.customField.description}>
      <Group pt={8}>
        <Switch
          label={t("switch_label")}
          checked={props.value}
          onChange={(event) => props.onChange(event.target.checked)}
        />
      </Group>
    </InputWrapper>
  );
};
