import { t } from "@lingui/core/macro";
import { CustomFieldType } from "./custom-field-types";

export const customFieldTypes: Record<CustomFieldType, { label: () => string }> = {
  [CustomFieldType.TEXT]: { label: () => t`Text` },
  [CustomFieldType.NUMBER]: { label: () => t`Number` },
  [CustomFieldType.SWITCH]: { label: () => t`Switch` },
  [CustomFieldType.DATE]: { label: () => t`Date` },
  [CustomFieldType.SELECT]: { label: () => t`Select` },
  [CustomFieldType.MULTI_SELECT]: { label: () => t`Multi select` },
  [CustomFieldType.TEXTAREA]: { label: () => t`Textarea` },
  [CustomFieldType.FILE]: { label: () => t`File` },
};
