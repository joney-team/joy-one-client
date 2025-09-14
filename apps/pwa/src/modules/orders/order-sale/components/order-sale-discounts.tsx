"use client";

import { Button } from "@/components/buttons/button";
import { num, t } from "@/modules/lang/lang-service";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconCoin, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { useOrderSale } from "../order-sale-context";
import { InputModalType, OnModalInput } from "@/modals/modal-input";

export const OrderSaleDiscounts: FC = () => {
  const orderSale = useOrderSale();
  const directDiscount = orderSale.activeOrder?.directDiscount ?? 0;

  const onDirectDiscount = () => {
    OnModalInput({
      title: "TIP",
      icon: IconCoin,
      type: InputModalType.MONEY,
      value: directDiscount > 0 ? directDiscount : undefined,
      onDone: (value) => {
        orderSale.updateOrder({ tipAmount: value });
      },
      onClear: () => {
        orderSale.updateOrder({ tipAmount: 0 });
      },
    });
  };

  if (!orderSale.activeOrder) return null;

  return (
    <Group justify="space-between">
      <Group gap={5}>
        <Text>{t("discounts")}</Text>

        {directDiscount > 0 ? (
          <Button
            rightIcon={IconPencil}
            size="compact-xs"
            variant="subtle"
            component="div"
            onClick={onDirectDiscount}
          >
            {t("direct")}: {num(directDiscount, { type: "money" })}
          </Button>
        ) : (
          <Button
            component="div"
            leftIcon={IconPlus}
            size="compact-xs"
            variant="subtle"
            onClick={onDirectDiscount}
          >
            {t("direct_discount")}
          </Button>
        )}
      </Group>

      <Group gap={8}>
        {orderSale.calculating.isLoading ? (
          <Skeleton h={20} w={80} visible={orderSale.calculating.isLoading} />
        ) : (
          <Text>{num(orderSale.activeOrder.directDiscount, { type: "money" })}</Text>
        )}
      </Group>
    </Group>
  );
};
