"use client";

import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { FormProduct, FormProductProps } from "../components/form-product";

const ModalContent = (props: FormProductProps) => {
  return <FormProduct {...props} onClose={() => modals.close("ModalProductForm")} />;
};

export const OnProductModal = (props: FormProductProps) => {
  const product = "product" in props ? props.product : undefined;
  const type = "type" in props ? props.type : product?.type;

  let title = `${t(product ? "update" : "create_new")}`;
  if (type || product) title += ` ${t(`product_type_${type || product?.type}`)}`;

  return modals.open({
    modalId: "ModalProductForm",
    size: 1000,
    title: <ModalTitle title={title} icon={product ? IconEdit : IconPlus} />,
    children: <ModalContent {...props} />,
  });
};
