"use client";

import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { EventType } from "@/modules/events/event-types";
import { OrderCard } from "@/modules/orders/order-card";
import { onPayOrder } from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { userColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { IconCalendarDown, IconCashRegister, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { OrderEntity } from "./order-entity";
import { OrderItemsColumn } from "./order-items-columns";
import { orderPaymentStatuses } from "./orders-constants";

export const OrderList: FC = () => {
  const workspace = useWorkspace();
  const workspaceModule = workspace.getAvailableModule("orders");

  if (!workspaceModule) return null;

  return (
    <Stack p={16}>
      <List<OrderEntity>
        id="ors"
        name={workspaceModule.name}
        icon={workspaceModule.icon}
        route="/orders"
        columns={{
          code: codeColumn({ href: (value) => `/orders/${value}` }),
          createdAt: dateTimeColumn({ name: t`Time`, sortable: true }),
          relatedCustomerId: customerColumn({
            name: t`Customer`,
            valuePath: "relatedCustomer",
          }),
          createdByUserId: userColumn({
            name: t`Created by`,
            valuePath: "createdByUser",
          }),
          items: OrderItemsColumn,
          totalAmount: numberColumn({
            name: t`Money amount`,
            type: "money",
            sortable: true,
            defaultWidth: 200,
          }),
          paymentStatus: statusColumn({
            defaultWidth: 200,
            name: t`Payment status`,
            options: Object.values(OrderPaymentStatus).map((status) => ({
              label: orderPaymentStatuses[status].label(),
              color: orderPaymentStatuses[status].color,
              value: status,
            })),
            rightSection: (order) => {
              if (order.paymentStatus === OrderPaymentStatus.PROCESSING) {
                return (
                  <Tooltip label={t`Pay`}>
                    <ActionIcon onClick={() => onPayOrder(order)}>
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
            name: t`Orders today`,
            icon: IconCalendarDown,
            replaceFilterKeys: ["createdAt"],
            params: () => ({
              timeRangeCreatedAt: `date-${DateTime.toSeconds(new Date())}`,
            }),
          },
        ]}
        events={[
          EventType.ORDER_NEW,
          EventType.ORDER_UPDATED,
          EventType.ORDER_ARCHIVED,
          EventType.ORDER_SYNCED,
        ]}
        creatable={{
          href: "/orders/sale?mode=new",
          permission: WorkspacePermission.ORDERS_CREATE,
        }}
        actions={[
          {
            label: t`Edit`,
            icon: IconEdit,
            href: (data) => `/orders/sale?code=${data.code}`,
          },
        ]}
        card={OrderCard}
      />
    </Stack>
  );
};
