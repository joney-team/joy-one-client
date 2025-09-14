"use client";

import { ActionIcon, Group } from "@mantine/core";
import { IconPrinter, IconTrash } from "@tabler/icons-react";
import { type FC } from "react";
import { useOrderSale } from "../order-sale-context";

export const OrderSaleActions: FC = () => {
  const orderSale = useOrderSale();

  return (
    <Group>
      <ActionIcon>
        <IconPrinter size={20} />
      </ActionIcon>

      <ActionIcon onClick={orderSale.removeOrder}>
        <IconTrash size={20} />
      </ActionIcon>
    </Group>
  );
};
