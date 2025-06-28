import { ModalTitle } from "@/components/modal-title";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
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
            ? t(`event_type_${EventType.CATEGORY_UPDATED}`)
            : t(`event_type_${EventType.CATEGORY_NEW}`)
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
