import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { CategoryEntity, CategoryType } from "../category-types";
import { FormCategory } from "../components/form-category";
import { IconCategory } from "@tabler/icons-react";
import { EventType } from "@/modules/events/event-types";

interface OnModalCategoryProps {
  type?: CategoryType;
  category?: CategoryEntity;
  onSuccess?: (category: CategoryEntity) => void;
}

export const OnModalCategory = (props?: OnModalCategoryProps) => {
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
      />
    ),
  });
};
