"use client";

import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { EventType, OrderPaymentStatus } from "@/graphql/enums.graphql";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { OrderCard } from "@/modules/orders/order-card";
import { userColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { nonLoading } from "@/utils/non-loading";
import { DateTime } from "@joy-one-client/utils/date-time";
import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { IconCalendarDown, IconCashRegister, IconEdit } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, type FC } from "react";
import { useAvailableWorkspaceModules } from "../workspaces/workspace-modules";
import { OrderItemsColumn } from "./order-items-columns";
import { orderPaymentStatuses } from "./orders-constants";

import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ModalPayReceiptRef } from "../receipts/modals/modal-pay-receipt";
import { OrderFragment } from "./graphql/fragmentOrder.graphql";
import GetOrdersDocument from "./graphql/getOrders.graphql";
import PayOrderDocument from "./graphql/payOrder.graphql";

const ModalPayReceipt = dynamic(
  () => import("../receipts/modals/modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const OrderList: FC = () => {
  const { t } = useLingui();
  const client = useApolloClient();
  const { getAvailableModule } = useAvailableWorkspaceModules();
  const workspaceModule = getAvailableModule("orders");
  const modalPayReceiptRef = useRef<ModalPayReceiptRef>(null);

  if (!workspaceModule) return null;

  return (
    <Stack p="md">
      <List<OrderFragment>
        id="ors"
        name={workspaceModule.name}
        icon={workspaceModule.icon}
        query={GetOrdersDocument}
        columns={{
          code: codeColumn({ href: (value) => `/orders/${value}` }),
          createdAt: dateTimeColumn({ name: <Trans>Time</Trans>, sortable: true }),
          relatedCustomerId: customerColumn({
            name: <Trans>Customer</Trans>,
            valuePath: "relatedCustomer",
          }),
          createdByUser: userColumn({
            name: <Trans>Created by</Trans>,
            valuePath: "createdByUser",
          }),
          items: OrderItemsColumn,
          totalAmount: numberColumn({
            name: <Trans>Money amount</Trans>,
            type: "money",
            sortable: true,
            defaultWidth: 200,
          }),
          paymentStatus: statusColumn({
            defaultWidth: 200,
            name: <Trans>Payment status</Trans>,
            options: Object.values(OrderPaymentStatus).map((status) => ({
              label: t(orderPaymentStatuses[status].label),
              color: orderPaymentStatuses[status].color,
              value: status,
            })),
            rightSection: (order) => {
              if (order.paymentStatus === OrderPaymentStatus.Processing) {
                const onPayOrder = async () => {
                  const result = await client.mutate({
                    mutation: PayOrderDocument,
                    variables: {
                      orderId: order.id,
                      amount: order.totalAmount - (order.paidAmount || 0),
                    },
                  });

                  if (!result.data?.payOrder) throw new Error("Failed to pay order");

                  modalPayReceiptRef.current?.open({ receipt: { id: result.data?.payOrder } });
                };

                return (
                  <Tooltip label={<Trans>Pay</Trans>}>
                    <ActionIcon onClick={onPayOrder}>
                      <IconCashRegister size={16} />
                    </ActionIcon>
                  </Tooltip>
                );
              }
            },
          }),
        }}
        filterModes={[
          {
            param: "today",
            name: <Trans>Orders today</Trans>,
            icon: IconCalendarDown,
            replaceFilterKeys: ["createdAt"],
            params: () => ({
              timeRangeCreatedAt: `date-${DateTime.toSeconds(new Date())}`,
            }),
          },
        ]}
        events={[
          EventType.OrderNew,
          EventType.OrderUpdated,
          EventType.OrderArchived,
          EventType.OrderSynced,
        ]}
        creatable={{
          href: "/orders/sale?mode=new",
          permission: WorkspacePermission.ORDERS_CREATE,
        }}
        actions={[
          {
            label: <Trans>Edit</Trans>,
            icon: IconEdit,
            href: (data) => `/orders/sale?code=${data.code}`,
          },
        ]}
        card={OrderCard}
      />

      <ModalPayReceipt ref={modalPayReceiptRef} />
    </Stack>
  );
};
