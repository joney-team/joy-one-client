import { CustomField, CustomFieldValue } from "./custom-field-types";

export const getCustomFieldValue = (customFields?: CustomField[] | null): CustomFieldValue[] => {
  if (!customFields) return [];
  
  return customFields.map((customField) => ({
    customFieldId: customField.customFieldId,
    value: Array.isArray(customField.value)
      ? customField.value.map((v) => v.id || v._id)
      : customField.value,
  })) || [];
};