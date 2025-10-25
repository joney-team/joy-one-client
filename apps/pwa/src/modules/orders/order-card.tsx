"use client";

import { OnModalPrinter } from "@/modals/modal-printer";
import { num, renderDateTime, tl } from "@/modules/lang/lang-service";
import { OrderEntity } from "@/modules/orders/order-entity";
import {
  onPayOrder,
  orderPaymentStatusOptions,
  updateOrder,
} from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { Anchor, Card, CardProps, Group, Stack, Table, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCashRegister, IconEdit, IconPrinter } from "@tabler/icons-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { Button } from "../../components/buttons/button";
import { Circle } from "../../components/circle";
import { Renderer } from "../../components/renderer";
import { CustomerInput } from "../customers/components/customer-input";
import { WorkspaceMemberInput } from "../workspace-members/components/workspace-member-input";
import { WorkspaceMembersInput } from "../workspace-members/components/workspace-members-input";
import {
  normalizeEntityToOrder,
  normalizeOrderForSubmission,
} from "./orders-management/orders-management-utils";

interface OrderCardProps {
  data: OrderEntity;
  hideCustomer?: boolean;
  cardProps?: CardProps;
}

export const OrderCard: FC<OrderCardProps> = (props) => {
  const workspace = useWorkspace();
  const color = useColor();
  const [order, setOrder] = useState<OrderEntity>();
  const isAbleToEdit = workspace.hasPermission(WorkspacePermission.ORDERS_UPDATE);

  const updateOrderDebounced = useDebouncedCallback(async (newOrder: OrderEntity) => {
    if (!order) return;
    const _order = normalizeEntityToOrder(newOrder);

    onActionLoad({
      process: async () => updateOrder(order.id, normalizeOrderForSubmission(_order)),
    });
  }, 1000);

  const onUpdateOrder = (newOrder: OrderEntity) => {
    setOrder(newOrder);
    updateOrderDebounced(newOrder);
  };

  useEffect(() => {
    const isDiff = JSON.stringify(order || {}) !== JSON.stringify(props.data);
    if (isDiff) setOrder(props.data);
  }, [props.data]);

  if (!order) return null;

  return (
    <Card shadow="xs" flex={1} {...props.cardProps}>
      <Stack flex={1}>
        <Stack flex={1}>
          <Group align="start">
            <Stack gap={10} flex={1}>
              <Group align="center">
                <Anchor component={Link} href={`/orders/${order.code}`}>
                  <Text fw={700} fz={16}>
                    #{order.code}
                  </Text>
                </Anchor>

                <Card px={8} py={3} withBorder shadow="none" bg="transparent">
                  <Group gap={8}>
                    <Circle
                      color={color(orderPaymentStatusOptions[order.paymentStatus].color)}
                      size={10}
                    />

                    <Text fz={14} fw={500}>
                      {tl(`order_payment_status_${order.paymentStatus}`)}
                    </Text>
                  </Group>
                </Card>
              </Group>

              <Group align="start">
                <Renderer visible={!props.hideCustomer}>
                  <CustomerInput
                    label={tl("customer")}
                    disabled={!isAbleToEdit}
                    value={order.relatedCustomer}
                    clearable
                    onSelect={(customer) =>
                      onUpdateOrder({
                        ...order,
                        relatedCustomer: customer,
                      })
                    }
                  />
                </Renderer>

                <WorkspaceMemberInput
                  label={tl("main_assignee")}
                  value={order.assigneeUsers?.[0]}
                  disabled={!isAbleToEdit}
                  clearable
                  onChange={(user) => {
                    const isChanged = user?.userId !== order.assigneeUsers?.[0]?.userId;
                    if (!isChanged) return;

                    onUpdateOrder({
                      ...order,
                      assigneeUsers: user ? [user] : [],
                    });
                  }}
                />
              </Group>
            </Stack>

            <Stack gap={0}>
              <Text ta="right" fz={13} c="gray">
                {renderDateTime(order.createdAt)}
              </Text>
            </Stack>
          </Group>

          <Table horizontalSpacing={0}>
            <Table.Tbody>
              {order.items.map((item, index) => {
                return (
                  <Table.Tr key={item.product._id}>
                    <Table.Td>
                      <Group gap={8}>
                        <Text>
                          {index + 1}. {item.product.name}
                        </Text>
                        <WorkspaceMembersInput
                          collapsed
                          value={item.assigneeUsers}
                          disabled={!isAbleToEdit}
                          onChange={(users) => {
                            onUpdateOrder({
                              ...order,
                              items: order.items.map((item, i) => {
                                if (index === i) {
                                  return {
                                    ...item,
                                    assigneeUsers: users,
                                  };
                                }
                                return item;
                              }),
                            });
                          }}
                        />
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">x{num(item.quantity)}</Table.Td>
                    <Table.Td ta="right">{num(item.price, { type: "money" })}</Table.Td>
                  </Table.Tr>
                );
              })}

              <Table.Tr>
                <Table.Td colSpan={2} ta="right">
                  {tl("subtotal")}
                </Table.Td>
                <Table.Td ta="right">
                  {num(
                    order.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
                    { type: "money" }
                  )}
                </Table.Td>
              </Table.Tr>

              <Table.Tr>
                <Table.Td colSpan={2} ta="right">
                  {tl("discount")}
                </Table.Td>
                <Table.Td ta="right">
                  {num(
                    order.discounts.reduce((acc, discount) => acc + discount.amount, 0),
                    { type: "money" }
                  )}
                </Table.Td>
              </Table.Tr>

              <Table.Tr>
                <Table.Td colSpan={2} ta="right" fw={600}>
                  {tl("total")}
                </Table.Td>
                <Table.Td ta="right" fw={600}>
                  {num(order.totalAmount, { type: "money" })}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>

        <Stack align="center">
          <Group>
            {order.paymentStatus === OrderPaymentStatus.PROCESSING && (
              <Button leftIcon={IconCashRegister} onClick={() => onPayOrder(order)}>
                {tl("pay")}
              </Button>
            )}

            <Button
              leftIcon={IconPrinter}
              onClick={() => OnModalPrinter({ order, customer: order.relatedCustomer })}
              variant="outline"
            >
              {tl("print")}
            </Button>
          </Group>

          <Group justify="center">
            <Button
              variant="subtle"
              component={Link}
              href={`/orders/sale?code=${order.code}`}
              size="xs"
              leftIcon={IconEdit}
              color="gray"
              fw={400}
            >
              {tl("edit")}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
};
