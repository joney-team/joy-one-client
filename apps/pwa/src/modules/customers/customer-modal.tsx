"use client";

import { ModalTitle } from "@/components/modal-title";
import { modals } from "@mantine/modals";
import { IconUser, IconUserPlus } from "@tabler/icons-react";

import { getView } from "@/layout/layout-service";
import { CustomerForm, CustomerFormProps } from "@/modules/customers/components/form-customer";
import { t } from "@lingui/core/macro";

export const OnCustomerModal = (props?: CustomerFormProps) =>
  modals.open({
    modalId: "CustomerForm",
    title: (
      <ModalTitle
        title={props?.customer ? `${t`Update customer`}` : `${t`Create customer`}`}
        icon={props?.customer ? IconUser : IconUserPlus}
      />
    ),
    children: <CustomerForm {...props} onClose={() => modals.close("CustomerForm")} />,
    fullScreen: getView() === "mobile",
    size: "lg",
  });
