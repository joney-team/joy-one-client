"use client";

import { FC } from "react";
import { CustomFieldTextInput } from "./text";
import { CustomFieldInputProps } from "../components/builder-custom-fields";
import { CustomFieldNumberInput } from "./number";
import { CustomFieldSwitchInput } from "./switch";
import { CustomFieldType } from "@/graphql/enums.graphql";

export const customFieldInputs: Partial<Record<CustomFieldType, FC<CustomFieldInputProps>>> = {
  [CustomFieldType.Text]: CustomFieldTextInput,
  [CustomFieldType.Number]: CustomFieldNumberInput,
  [CustomFieldType.Switch]: CustomFieldSwitchInput,
};
