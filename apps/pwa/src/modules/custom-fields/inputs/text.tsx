import { FC } from "react";
import { CustomFieldInputProps } from "../components/builder-custom-fields";
import { TextInput } from "@mantine/core";

export const CustomFieldTextInput: FC<CustomFieldInputProps> = (props) => {
  return (
    <TextInput
      label={props.customField.label}
      description={props.customField.description}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.customField.placeholder}
    />
  );
};
