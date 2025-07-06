"use client";

import { useLayout } from "@/layout/layout-context";
import type { CustomerEntity } from "@/modules/customers/customer-types";
import { OrderEntity } from "@/modules/orders/order-entity";
import { modals } from "@mantine/modals";
import { FC, useEffect } from "react";
import { OrderTable } from ".";
import { useOrderTable } from "./order-table-context";
import { OrderTableProvider } from "./order-table-provider";
import { zIndexes } from "@joy-one-client/config/layout";

export interface OrderTableModalArgs {
  order?: OrderEntity;
  customer?: CustomerEntity;
}

export const ModalOrderTable: FC<OrderTableModalArgs & { onClose: () => void }> = (props) => {
  const layout = useLayout();
  const orderForm = useOrderTable();

  useEffect(() => {
    if (props.order) orderForm.setOrder(props.order);
    if (props.customer) orderForm.setCustomer(props.customer);
  }, [props]);

  return (
    <OrderTable
      size={{
        w: layout.width,
        h: layout.height,
      }}
      onExit={props.onClose}
      onCloseOrder={() => {
        if (props.order) props.onClose();
      }}
    />
  );
};

export const OnModalOrderTable = (args?: OrderTableModalArgs) => {
  modals.open({
    modalId: "OrderTable",
    withCloseButton: false,
    fullScreen: true,
    children: (
      <OrderTableProvider>
        <ModalOrderTable {...args} onClose={() => modals.close("OrderTable")} />
      </OrderTableProvider>
    ),
    onClose: () => {
      modals.close("OrderTable");
    },
    zIndex: zIndexes.modals - 10,
    styles: {
      body: {
        padding: 0,
      },
    },
  });
};
