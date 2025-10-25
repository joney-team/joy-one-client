import { ModalTitle } from "@/components/modal-title";
import { EventType } from "@/modules/events/event-types";
import { tl } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { IconForms } from "@tabler/icons-react";
import { FormCustomField, FormCustomFieldProps } from "../components/form-custom-field";

export const OnModalCustomField = (props?: FormCustomFieldProps) => {
  return modals.open({
    modalId: "modal-custom-field",
    title: (
      <ModalTitle
        title={
          props?.customField
            ? tl(`event_type_${EventType.CUSTOM_FIELDS_UPDATED}`)
            : tl(`event_type_${EventType.CUSTOM_FIELDS_NEW}`)
        }
        icon={IconForms}
      />
    ),
    children: (
      <FormCustomField
        {...props}
        onSuccess={(customField) => {
          modals.close("modal-custom-field");
          props?.onSuccess?.(customField);
        }}
        onArchive={() => {
          modals.close("modal-custom-field");
          props?.onArchive?.();
        }}
      />
    ),
  });
};
