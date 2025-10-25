"use client";

import { OnModalPrinter } from "@/modals/modal-printer";
import { num, renderDateTime } from "@/modules/lang/lang-service";
import { OrderEntity } from "@/modules/orders/order-entity";
import { onPayOrder, updateOrder } from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
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
import { orderPaymentStatuses } from "./orders-constants";
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
                      color={color(orderPaymentStatuses[order.paymentStatus].color)}
                      size={10}
                    />

                    <Text fz={14} fw={500}>
                      {orderPaymentStatuses[order.paymentStatus].label()}
                    </Text>
                  </Group>
                </Card>
              </Group>

              <Group align="start">
                <Renderer visible={!props.hideCustomer}>
                  <CustomerInput
                    label={t`Customer`}
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
                  label={t`Main assignee`}
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
                  {t`Subtotal`}
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
                  {t`Discount`}
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
                  {t`Total`}
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
                {t`Pay`}
              </Button>
            )}

            <Button
              leftIcon={IconPrinter}
              onClick={() => OnModalPrinter({ order, customer: order.relatedCustomer })}
              variant="outline"
            >
              {t`Print`}
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
              {t`Edit`}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
};
