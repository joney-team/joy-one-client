import { FC } from "react";
import { CustomFieldInputProps } from "../components/builder-custom-fields";
import { TextInput } from "@mantine/core";

export const CustomFieldTextInput: FC<CustomFieldInputProps> = (props) => {
  return (
    <TextInput
      label={props.customField.label}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};
