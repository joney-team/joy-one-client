"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconCoin, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

export const OrderSaleTip: FC = () => {
  const workspace = useWorkspace();
  const orderSale = userOrdersManagement();
  const tipAmount = orderSale.activeOrder?.tipAmount ?? 0;

  const onTip = () => {
    OnModalInput({
      title: t`Tip`,
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
        <Text>{t`Tip`}</Text>

        <Button
          component="div"
          leftIcon={tipAmount ? IconPencil : IconPlus}
          size="compact-xs"
          variant="subtle"
        >
          {tipAmount ? t`Edit` : t`Add`}
        </Button>
      </Group>

      <Group gap={8}>
        {orderSale.calculating.isLoading ? (
          <Skeleton h={20} w={80} visible={orderSale.calculating.isLoading} />
        ) : (
          <Text>
            <CurrencyFormat value={orderSale.activeOrder.tipAmount ?? 0} />
          </Text>
        )}
      </Group>
    </Group>
  );
};
