"use client";

import { ActionIcon, Group } from "@mantine/core";
import { IconPrinter, IconTrash } from "@tabler/icons-react";
import { type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

export const OrderSaleActions: FC = () => {
  const orderSale = userOrdersManagement();

  return (
    <Group gap={8}>
      <ActionIcon>
        <IconPrinter size={20} strokeWidth={1.5} />
      </ActionIcon>

      <ActionIcon onClick={orderSale.removeOrder}>
        <IconTrash size={20} strokeWidth={1.5} />
      </ActionIcon>
    </Group>
  );
};
