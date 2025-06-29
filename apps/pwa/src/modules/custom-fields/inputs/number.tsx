import { NumberInput } from "@mantine/core";
import { FC } from "react";
import { CustomFieldInputProps } from "../components/builder-custom-fields";

export const CustomFieldNumberInput: FC<CustomFieldInputProps> = (props) => {
  return (
    <NumberInput
      label={props.customField.label}
      description={props.customField.description}
      value={props.value}
      onChange={(value) => props.onChange(value)}
      placeholder={props.customField.placeholder}
    />
  );
};
