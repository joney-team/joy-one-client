"use client";

import { ModalHead } from "@/components/modal/modal-head";
import { Trans } from "@lingui/react/macro";
import { modals } from "@mantine/modals";
import { IconForms } from "@tabler/icons-react";
import { FormCustomField, FormCustomFieldProps } from "../components/form-custom-field";

export const OnModalCustomField = (props?: FormCustomFieldProps) => {
  return modals.open({
    modalId: "modal-custom-field",
    title: <ModalHead name={<Trans>Custom field</Trans>} icon={IconForms} />,
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
