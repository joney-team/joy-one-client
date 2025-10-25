"use client";

import { ModalTitle } from "@/components/modal-title";
import { t } from "@lingui/core/macro";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { FormProduct, FormProductProps } from "../components/form-product";
import { productTypes } from "../products-constants";
import { ProductType } from "../products-types";

const ModalContent = (props: FormProductProps) => {
  return <FormProduct {...props} onClose={() => modals.close("ModalProductForm")} />;
};

export const OnProductModal = (props: FormProductProps) => {
  const product = "product" in props ? props.product : undefined;
  const type = "type" in props ? props.type : product?.type;

  let title = product ? t`Update product` : t`Create new product`;
  if (type || product)
    title += ` ${productTypes[type ?? product?.type ?? ProductType.PRODUCT].label()}`;

  return modals.open({
    modalId: "ModalProductForm",
    size: 1000,
    title: <ModalTitle title={title} icon={product ? IconEdit : IconPlus} />,
    children: <ModalContent {...props} />,
  });
};
