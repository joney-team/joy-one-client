"use client";

import { Button } from "@/components/buttons/button";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { num, t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconCoin, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { useOrderSale } from "../order-sale-context";

export const OrderSaleTip: FC = () => {
  const workspace = useWorkspace();
  const orderSale = useOrderSale();
  const tipAmount = orderSale.activeOrder?.tipAmount ?? 0;

  const onTip = () => {
    OnModalInput({
      title: "TIP",
      icon: IconCoin,
      type: InputModalType.MONEY,
      value: tipAmount > 0 ? tipAmount : undefined,
      onDone: (value) => {
        orderSale.updateOrder({ tipAmount: value });
      },
      onClear: () => {
        orderSale.updateOrder({ tipAmount: 0 });
      },
    });
  };

  if (!workspace.settings.allowTip || !orderSale.activeOrder) return null;

  return (
    <Group justify="space-between" onClick={onTip} className="clickable">
      <Group gap={5}>
        <Text>{t("TIP")}</Text>

        <Button
          component="div"
          leftIcon={tipAmount ? IconPencil : IconPlus}
          size="compact-xs"
          variant="subtle"
        >
          {t(tipAmount ? "edit" : "add")}
        </Button>
      </Group>

      <Group gap={8}>
        {orderSale.calculating.isLoading ? (
          <Skeleton h={20} w={80} visible={orderSale.calculating.isLoading} />
        ) : (
          <Text>{num(orderSale.activeOrder.tipAmount, { type: "money" })}</Text>
        )}
      </Group>
    </Group>
  );
};
