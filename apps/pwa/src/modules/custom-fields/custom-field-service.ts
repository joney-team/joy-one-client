import { CustomFieldValue } from "@/graphql/types.graphql";

export const getCustomFieldValue = (
  customFields?: CustomFieldValue[] | null,
): CustomFieldValue[] => {
  if (!customFields) return [];

  return (
    customFields.map((customField) => ({
      ...customField,
      customFieldId: customField.customFieldId,
      value: Array.isArray(customField.value)
        ? customField.value.map((v) => v.id || v._id)
        : customField.value,
    })) || []
  );
};
