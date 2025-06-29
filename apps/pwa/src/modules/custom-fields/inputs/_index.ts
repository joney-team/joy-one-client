import { FC } from "react";
import { CustomFieldType } from "../custom-field-types";
import { CustomFieldTextInput } from "./text";
import { CustomFieldInputProps } from "../components/builder-custom-fields";
import { CustomFieldNumberInput } from "./number";
import { CustomFieldSwitchInput } from "./switch";

export const customFieldInputs: Partial<Record<CustomFieldType, FC<CustomFieldInputProps>>> = {
  [CustomFieldType.TEXT]: CustomFieldTextInput,
  [CustomFieldType.NUMBER]: CustomFieldNumberInput,
  [CustomFieldType.SWITCH]: CustomFieldSwitchInput,
};