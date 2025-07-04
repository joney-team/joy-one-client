"use client";

import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { FormPromotion, FormPromotionProps } from "../components/form-promotion";

const Content = (props: FormPromotionProps) => {
  return <FormPromotion {...props} />;
};

export const OnPromotionModal = (props?: FormPromotionProps) => {
  return modals.open({
    modalId: "OnPromotionModal",
    size: "xl",
    title: (
      <ModalTitle
        title={t(props?.promotion ? "edit_entity" : "create_entity", { entity: "promotion" })}
        icon={props?.promotion ? IconEdit : IconPlus}
      />
    ),
    children: (
      <Content
        {...props}
        onSuccess={() => {
          modals.close("OnPromotionModal");
          props?.onSuccess?.();
        }}
      />
    ),
  });
};
