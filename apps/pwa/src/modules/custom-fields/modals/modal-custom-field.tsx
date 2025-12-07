"use client";

import { ModalTitle } from "@/components/modal-title";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconForms } from "@tabler/icons-react";
import { FormCustomField, FormCustomFieldProps } from "../components/form-custom-field";

export const OnModalCustomField = (props?: FormCustomFieldProps) => {
  return modals.open({
    modalId: "modal-custom-field",
    title: <ModalTitle title={<Trans>Custom field</Trans>} icon={IconForms} />,
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
