"use client";

import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { ProductType } from "@/modules/products/products-types";
import { Space, Tabs } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { FormProduct, FormProductProps } from "../components/form-product";

const ModalContent = (props: FormProductProps) => {
  const [typeActive, setTypeActive] = useState(props.type || Object.values(ProductType)[0]);
  const isAbleToSelectType = !props.product && !props.type;

  return (
    <Tabs value={typeActive} onChange={(t) => setTypeActive(t as ProductType)}>
      {isAbleToSelectType && (
        <Tabs.List>
          {Object.values(ProductType).map((type) => (
            <Tabs.Tab value={type} key={type + "tab"}>
              {t(`product_type_${type}`)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      )}

      {Object.values(ProductType).map((type) => (
        <Tabs.Panel value={type} key={type + "panel"}>
          {isAbleToSelectType && <Space h={16} />}
          <FormProduct {...props} type={type} onClose={() => modals.close("ModalProductForm")} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export const OnProductModal = (props: FormProductProps) => {
  let title = `${t(props.product ? "update" : "create_new")}`;
  if (props.type || props.product)
    title += ` ${t(`product_type_${props.type || props.product?.type}`)}`;

  return modals.open({
    modalId: "ModalProductForm",
    size: "xl",
    title: <ModalTitle title={title} icon={props.product ? IconEdit : IconPlus} />,
    children: <ModalContent {...props} />,
  });
};
