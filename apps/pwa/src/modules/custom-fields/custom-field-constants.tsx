import { CustomFieldType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";

export const customFieldTypes: Record<CustomFieldType, { label: MacroMessageDescriptor }> = {
  [CustomFieldType.Text]: { label: defineMessage`Text` },
  [CustomFieldType.Number]: { label: defineMessage`Number` },
  [CustomFieldType.Switch]: { label: defineMessage`Switch` },
  [CustomFieldType.Date]: { label: defineMessage`Date` },
  [CustomFieldType.Select]: { label: defineMessage`Select` },
  [CustomFieldType.MultiSelect]: { label: defineMessage`Multi select` },
  [CustomFieldType.Textarea]: { label: defineMessage`Textarea` },
  [CustomFieldType.File]: { label: defineMessage`File` },
};
