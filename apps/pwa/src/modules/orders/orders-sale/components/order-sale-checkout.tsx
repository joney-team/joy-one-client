"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { useLayout } from "@/layout/layout-context";
import { CustomerSelector } from "@/modules/customers/components/customer-selector";
import { num, tl } from "@/modules/lang/lang-service";
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { ActionIcon, Card, Divider, Group, Skeleton, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconCashRegister,
  IconChevronDown,
  IconDeviceFloppy,
  IconUserSquareRounded,
  IconX,
} from "@tabler/icons-react";
import { Fragment, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";
import { OrderSaleCombos } from "./order-sale-combos";
import { OrderSaleDiscounts } from "./order-sale-discounts";
import { OrderSaleItems } from "./order-sale-items";
import { OrderSalePromotions } from "./order-sale-promotions";
import { OrderSaleTip } from "./order-sale-tip";

export const OrderSaleCheckout: FC = () => {
  const orderSale = userOrdersManagement();
  const { view } = useLayout();

  if (!orderSale.activeOrder) return null;

  const subTotalAmount = (orderSale.calculating.data?.items ?? []).reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const paidAmount = orderSale.activeOrder?.paidAmount ?? 0;

  const ctas = (
    <Stack>
      {paidAmount > 0 && (
        <Fragment>
          <Group justify="space-between">
            <Text>{tl("paid")}</Text>
            <Text>{num(paidAmount, { type: "money" })}</Text>
          </Group>
        </Fragment>
      )}

      <Group justify="space-between">
        <Text tt="uppercase" fw={700}>
          {tl("total")}
        </Text>
        {orderSale.calculating.isLoading ? (
          <Skeleton h={20} w={80} visible={orderSale.calculating.isLoading} />
        ) : (
          <Text fw={700}>
            {num(
              (orderSale.calculating.data?.totalAmount || 0) +
                (orderSale.activeOrder.tipAmount ?? 0) -
                paidAmount,
              { type: "money" }
            )}
          </Text>
        )}
      </Group>

      <Group gap={8}>
        <Button
          h={42}
          tt="uppercase"
          onClick={() => orderSale.closeOrder()}
          variant="outline"
          color="gray"
        >
          {tl("close")}
        </Button>

        <Button
          h={42}
          tt="uppercase"
          onClick={orderSale.saveOrder}
          variant="outline"
          color="gray"
          leftIcon={IconDeviceFloppy}
          disabled={!orderSale.activeOrder.isDirty}
        >
          {tl("save")}
        </Button>

        <Button
          flex={1}
          action
          h={42}
          tt="uppercase"
          onClick={orderSale.payOrder}
          leftIcon={IconCashRegister}
        >
          {tl("pay")}
        </Button>
      </Group>
    </Stack>
  );

  return (
    <Stack mb={view === "mobile" ? 200 : 0} h="100%">
      <Card shadow="xs" mih="100%" w="100%" p={view === "mobile" ? 12 : undefined}>
        <Stack mih="100%">
          <Stack flex={1}>
            <Group align="center" justify="space-between">
              <CustomerSelector
                onSelect={(value) => orderSale.updateOrder({ relatedCustomer: value ?? null })}
                target={(customerSelectorCtx) => {
                  return (
                    <Group
                      onClick={customerSelectorCtx.toggle}
                      gap={10}
                      style={{ cursor: "pointer" }}
                    >
                      <Avatar
                        icon={IconUserSquareRounded}
                        customer={orderSale.activeOrder?.relatedCustomer}
                        size={40}
                        radius={8}
                      />

                      <Stack gap={0}>
                        <Text fz={10} c="gray">
                          {tl(orderSale.activeOrder?.relatedCustomer ? "customer" : "add_info")}
                        </Text>
                        <Group gap={3}>
                          <Text fz={14}>
                            {orderSale.activeOrder?.relatedCustomer?.name
                              ? orderSale.activeOrder.relatedCustomer?.name
                              : tl("customer")}
                          </Text>

                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (orderSale.activeOrder?.relatedCustomer) {
                                orderSale.updateOrder({ relatedCustomer: null });
                              } else {
                                customerSelectorCtx.toggle();
                              }
                            }}
                          >
                            {orderSale.activeOrder?.relatedCustomer ? (
                              <IconX size={14} />
                            ) : (
                              <IconChevronDown />
                            )}
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Group>
                  );
                }}
              />

              <Tooltip label={tl("assignee")}>
                <Group>
                  <WorkspaceMemberInput
                    value={orderSale.activeOrder?.assigneeUsers[0]}
                    onChange={(value) =>
                      orderSale.updateOrder({ assigneeUsers: value ? [value] : [] })
                    }
                    comboboxProps={{
                      position: "bottom-end",
                    }}
                    clearable
                  />
                </Group>
              </Tooltip>
            </Group>

            {view === "mobile" && (
              <Fragment>
                <OrderSaleItems />
                <Divider variant="dashed" />
              </Fragment>
            )}

            <Group justify="space-between">
              <Text>{tl("subtotal")}</Text>
              {orderSale.calculating.isLoading ? (
                <Skeleton h={20} w={80} visible />
              ) : (
                <Text>{num(subTotalAmount, { type: "money" })}</Text>
              )}
            </Group>

            <Divider variant="dashed" />
            <OrderSaleCombos />
            <OrderSalePromotions />
            <OrderSaleDiscounts />
            <OrderSaleTip />
          </Stack>

          {view !== "mobile" && (
            <Fragment>
              <Divider variant="dashed" />
              {ctas}
            </Fragment>
          )}
        </Stack>
      </Card>

      {view === "mobile" && (
        <Card
          radius={0}
          pos="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="var(--mantine-color-body)"
          p={12}
          style={{
            boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          {ctas}
        </Card>
      )}
    </Stack>
  );
};
