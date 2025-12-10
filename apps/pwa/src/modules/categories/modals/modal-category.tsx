"use client";

import { ModalHead } from "@/components/modal/modal-head";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconCategory } from "@tabler/icons-react";
import { FormCategory, FormCategoryProps } from "../components/form-category";

export const OnModalCategory = (props?: FormCategoryProps) => {
  return modals.open({
    modalId: "modal-category",
    title: <ModalHead name={<Trans>Category</Trans>} icon={IconCategory} />,
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
