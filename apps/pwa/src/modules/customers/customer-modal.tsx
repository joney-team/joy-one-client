"use client";

import { ModalTitle } from "@/components/modal-title";
import { modals } from "@mantine/modals";
import { IconUser, IconUserPlus } from "@tabler/icons-react";

import { CustomerForm, CustomerFormProps } from "@/modules/customers/customer-form";
import { getView } from "@/layout/layout-provider";
import { t } from "@/modules/lang/lang-service";

export const OnCustomerModal = (props?: CustomerFormProps) =>
  modals.open({
    modalId: "CustomerForm",
    title: (
      <ModalTitle
        title={props?.customer ? `${t("update")} ${t("customer")}` : `${t("create")} ${t("customer")}`}
        icon={props?.customer ? IconUser : IconUserPlus}
      />
    ),
    children: <CustomerForm {...props} onClose={() => modals.close("CustomerForm")} />,
    fullScreen: getView() === "mobile",
    size: "lg",
  });
