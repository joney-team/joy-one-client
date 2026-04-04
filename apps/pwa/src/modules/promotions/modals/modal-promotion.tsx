"use client";

import { ModalHead } from "@/components/modal/modal-head";
import { Trans } from "@lingui/react/macro";
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
      <ModalHead
        name={props?.promotion ? <Trans>Edit promotion</Trans> : <Trans>Create promotion</Trans>}
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
