import { ModalTitle } from "@/components/modal-title";
import { eventTypes } from "@/modules/events/event-constants";
import { EventType } from "@/modules/events/event-types";
import { modals } from "@mantine/modals";
import { IconCategory } from "@tabler/icons-react";
import { FormCategory, FormCategoryProps } from "../components/form-category";

export const OnModalCategory = (props?: FormCategoryProps) => {
  return modals.open({
    modalId: "modal-category",
    title: (
      <ModalTitle
        title={
          props?.category
            ? eventTypes[EventType.CATEGORY_UPDATED].name()
            : eventTypes[EventType.CATEGORY_NEW].name()
        }
        icon={IconCategory}
      />
    ),
    children: (
      <FormCategory
        {...props}
        onSuccess={(category) => {
          modals.close("modal-category");
          props?.onSuccess?.(category);
        }}
        onArchive={() => {
          modals.close("modal-category");
          props?.onArchive?.();
        }}
      />
    ),
  });
};
