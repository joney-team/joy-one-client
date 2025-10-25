"use client";

import { ModalTitle } from "@/components/modal-title";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { FormPromotion, FormPromotionProps } from "../components/form-promotion";
import { t } from "@lingui/core/macro";

const Content = (props: FormPromotionProps) => {
  return <FormPromotion {...props} />;
};

export const OnPromotionModal = (props?: FormPromotionProps) => {
  return modals.open({
    modalId: "OnPromotionModal",
    size: "xl",
    title: (
      <ModalTitle
        title={`${props?.promotion ? t`Edit promotion` : t`Create promotion`}`}
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
