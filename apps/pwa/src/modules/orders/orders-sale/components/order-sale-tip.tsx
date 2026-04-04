"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconCoin, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

export const OrderSaleTip: FC = () => {
  const { workspaceSetting } = useWorkspaceSetting();
  const orderSale = userOrdersManagement();
  const tipAmount = orderSale.activeOrder?.tipAmount ?? 0;

  if (!workspaceSetting?.allowTip || !orderSale.activeOrder) return null;

  return (
    <ModalInput>
      {(openInput) => {
        const onTip = () => {
          openInput({
            title: t`Tip`,
            icon: IconCoin,
            type: InputModalType.MONEY,
            value: tipAmount > 0 ? tipAmount : undefined,
            onDone: (value) => {
              orderSale.updateOrder({ tipAmount: value });
            },
            onClear: () => {
              orderSale.updateOrder({ tipAmount: null });
            },
          });
        };

        return (
          <Group justify="space-between" onClick={onTip} className="clickable">
            <Group gap={5}>
              <Text>
                <Trans>Tip</Trans>
              </Text>

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
              {orderSale.isCalculating ? (
                <Skeleton h={20} w={80} visible />
              ) : (
                <Text>
                  <CurrencyFormat value={orderSale.calculated?.tipAmount ?? 0} />
                </Text>
              )}
            </Group>
          </Group>
        );
      }}
    </ModalInput>
  );
};
