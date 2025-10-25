"use client";

import { Printer } from "@/components/printer/printer";
import { useLayout } from "@/layout/layout-context";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu } from "@mantine/core";
import { IconCirclePlus, IconDots, IconPrinter, IconTrash } from "@tabler/icons-react";
import { Fragment, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";
import { OrderCalculated } from "../../orders-management/orders-management-types";

export const OrderSaleActions: FC = () => {
  const orderSale = userOrdersManagement();
  const { view } = useLayout();
  const orderCalculated: OrderCalculated | undefined =
    orderSale.activeOrder && orderSale.calculating.data
      ? {
          ...orderSale.calculating.data,
          ...orderSale.activeOrder,
        }
      : undefined;

  if (view === "mobile") {
    return (
      <Group gap={4}>
        <ActionIcon onClick={() => orderSale.addOrder()}>
          <IconCirclePlus size={20} strokeWidth={1.5} />
        </ActionIcon>

        {orderSale.activeOrder && (
          <Menu>
            <Menu.Target>
              <ActionIcon>
                <IconDots size={20} strokeWidth={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={orderSale.removeOrder}
                leftSection={<IconTrash size={20} strokeWidth={1.5} />}
              >
                <Trans>Archive</Trans>
              </Menu.Item>

              <Menu.Item leftSection={<IconPrinter size={20} strokeWidth={1.5} />}>
                <Trans>Print</Trans>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    );
  }

  return (
    <Group gap={8}>
      <ActionIcon onClick={() => orderSale.addOrder()}>
        <IconCirclePlus size={20} strokeWidth={1.5} />
      </ActionIcon>

      {orderSale.activeOrder && (
        <Fragment>
          <Printer order={orderCalculated!}>
            {({ open }) => {
              return (
                <ActionIcon
                  component="div"
                  onClick={() => {
                    if (!orderCalculated) return;
                    open();
                  }}
                >
                  <IconPrinter size={20} strokeWidth={1.5} />
                </ActionIcon>
              );
            }}
          </Printer>

          <ActionIcon onClick={orderSale.removeOrder}>
            <IconTrash size={20} strokeWidth={1.5} />
          </ActionIcon>
        </Fragment>
      )}
    </Group>
  );
};
