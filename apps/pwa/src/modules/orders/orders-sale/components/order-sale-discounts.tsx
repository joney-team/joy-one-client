"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { OrderDiscountType } from "@/graphql/enums.graphql";
import { InputModalType, ModalInput, ModalInputRef } from "@/modals/modal-input";
import { Trans } from "@lingui/react/macro";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconCoin, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC, useRef } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

export const OrderSaleDiscounts: FC = () => {
  const orderSale = userOrdersManagement();
  const directDiscount = orderSale.activeOrder?.directDiscount ?? 0;
  const modalDirectDiscountRef = useRef<ModalInputRef>(null);

  const onDirectDiscount = () => {
    modalDirectDiscountRef.current?.open({
      title: <Trans>Direct Discount</Trans>,
      icon: IconCoin,
      type: InputModalType.MONEY,
      value: directDiscount > 0 ? directDiscount : undefined,
      onDone: (value) => {
        orderSale.updateOrder({ directDiscount: value });
      },
      onClear: () => {
        orderSale.updateOrder({ directDiscount: 0 });
      },
    });
  };

  if (!orderSale.activeOrder) return null;

  return (
    <Group justify="space-between">
      <Group gap={5}>
        <Text>
          <Trans>Discount</Trans>
        </Text>

        {directDiscount > 0 ? (
          <Button
            rightIcon={IconPencil}
            size="compact-xs"
            variant="subtle"
            component="div"
            onClick={onDirectDiscount}
          >
            <Trans>Direct</Trans>: <CurrencyFormat value={directDiscount} />
          </Button>
        ) : (
          <Button
            component="div"
            leftIcon={IconPlus}
            size="compact-xs"
            variant="subtle"
            onClick={onDirectDiscount}
          >
            <Trans>Direct discount</Trans>
          </Button>
        )}
      </Group>

      <Group gap={8}>
        {orderSale.isCalculating ? (
          <Skeleton h={20} w={80} visible />
        ) : (
          <Text>
            <CurrencyFormat
              value={
                orderSale.calculated?.discounts.reduce((total, discount) => {
                  if (discount.type === OrderDiscountType.Direct) {
                    return total + discount.amount;
                  }
                  return total;
                }, 0) ?? 0
              }
            />
          </Text>
        )}
      </Group>

      <ModalInput ref={modalDirectDiscountRef} />
    </Group>
  );
};
