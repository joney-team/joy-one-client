"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { OrderEntity } from "@/modules/orders/order-entity";
import { payOrder, updateOrder } from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { nonLoading } from "@/utils/non-loading";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Anchor, Card, CardProps, Group, Stack, Table, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCashRegister, IconEdit, IconPrinter } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { Button } from "../../components/buttons/button";
import { Circle } from "../../components/circle";
import { Renderer } from "../../components/renderer";
import { CustomerInput } from "../customers/components/customer-input";
import { type ModalPayReceiptRef } from "../receipts/modals/modal-pay-receipt";
import { WorkspaceMemberInput } from "../workspace-members/components/workspace-member-input";
import { WorkspaceMembersInput } from "../workspace-members/components/workspace-members-input";
import { orderPaymentStatuses } from "./orders-constants";
import {
  normalizeEntityToOrder,
  normalizeOrderForSubmission,
} from "./orders-management/orders-management-utils";

const ModalPayReceipt = dynamic(
  () => import("../receipts/modals/modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalPrinter = dynamic(
  () => import("../../modals/modal-printer").then((mod) => mod.ModalPrinter),
  {
    ssr: false,
    loading: nonLoading,
  }
);

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
  const modalPayReceiptRef = useRef<ModalPayReceiptRef | null>(null);

  const updateOrderDebounced = useDebouncedCallback(async (newOrder: OrderEntity) => {
    if (!order) return;
    const _order = normalizeEntityToOrder(newOrder);

    onActionLoad({
      name: <Trans>Update order</Trans>,
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

  const onPayOrder = async () => {
    if (!order) return;
    const receipt = await payOrder(order.id, {
      amount: order.totalAmount - order.paidAmount,
    });
    modalPayReceiptRef.current?.open({ receipt });
  };

  if (!order) return null;

  return (
    <Fragment>
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
                          relatedCustomer: customer as any,
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
                  <DateFormat value={order.createdAt} type="date-time" />
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
                      <Table.Td ta="right">
                        x<NumberFormat value={item.quantity} />
                      </Table.Td>
                      <Table.Td ta="right">
                        <CurrencyFormat value={item.price} />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}

                <Table.Tr>
                  <Table.Td colSpan={2} ta="right">
                    {t`Subtotal`}
                  </Table.Td>
                  <Table.Td ta="right">
                    <CurrencyFormat
                      value={order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)}
                    />
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td colSpan={2} ta="right">
                    {t`Discount`}
                  </Table.Td>
                  <Table.Td ta="right">
                    <CurrencyFormat
                      value={order.discounts.reduce((acc, discount) => acc + discount.amount, 0)}
                    />
                  </Table.Td>
                </Table.Tr>

                <Table.Tr>
                  <Table.Td colSpan={2} ta="right" fw={600}>
                    {t`Total`}
                  </Table.Td>
                  <Table.Td ta="right" fw={600}>
                    <CurrencyFormat value={order.totalAmount} />
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack align="center">
            <Group>
              {order.paymentStatus === OrderPaymentStatus.PROCESSING && (
                <Button leftIcon={IconCashRegister} onClick={onPayOrder}>
                  <Trans>Pay</Trans>
                </Button>
              )}

              <ModalPrinter>
                {(modal) => (
                  <Button
                    leftIcon={IconPrinter}
                    onClick={() => modal.open({ order, customer: order.relatedCustomer })}
                    variant="outline"
                  >
                    <Trans>Print</Trans>
                  </Button>
                )}
              </ModalPrinter>
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
                <Trans>Edit</Trans>
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Card>

      <ModalPayReceipt ref={modalPayReceiptRef} />
    </Fragment>
  );
};
