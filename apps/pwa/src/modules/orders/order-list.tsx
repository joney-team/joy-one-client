import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { NumberColumn } from "@/components/list/columns/number-column";
import { StatusColumn } from "@/components/list/columns/status-column";
import { CustomerColumn } from "@/modules/customers/components/customer-column";
import { EventType } from "@/modules/events/event-types";
import { tl } from "@/modules/lang/lang-service";
import { OrderCard } from "@/modules/orders/order-card";
import { onPayOrder, orderPaymentStatusOptions } from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { UserColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@/utils/date-time.utils";
import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { IconCalendarDown, IconCashRegister, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { OrderEntity } from "./order-entity";
import { OrderItemsColumn } from "./order-items-columns";

export const OrderList: FC = () => {
  const workspace = useWorkspace();
  const mod = workspace.getModule("orders");

  if (!mod) return null;

  return (
    <Stack p={16}>
      <List<OrderEntity>
        id="ors"
        name={mod.name()}
        icon={mod.icon}
        route="/orders"
        columns={{
          code: CodeColumn({ href: (value) => `/orders/${value}` }),
          createdAt: DateTimeColumn({ name: "time", sortable: true }),
          relatedCustomerId: CustomerColumn({
            name: "customer",
            valuePath: "relatedCustomer",
          }),
          createdByUserId: UserColumn({
            name: "createdByUser",
            valuePath: "createdByUser",
          }),
          items: OrderItemsColumn,
          totalAmount: NumberColumn({ type: "money", sortable: true }),
          paymentStatus: StatusColumn({
            w: 200,
            options: Object.values(OrderPaymentStatus).map((status) => ({
              label: tl(`order_payment_status_${status}`),
              value: status,
              color: orderPaymentStatusOptions[status].color,
            })),
            rightSection: (order) => {
              if (order.paymentStatus === OrderPaymentStatus.PROCESSING) {
                return (
                  <Tooltip label={tl("pay")}>
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
            name: tl("today_entity", { entity: mod.name() }),
            icon: IconCalendarDown,
            replaceFilterKeys: ["createdAt"],
            params: () => ({
              timeRangeCreatedAt: `date-${DateTime.timeToSeconds()}`,
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
            label: "edit",
            icon: IconEdit,
            href: (data) => `/orders/sale?code=${data.code}`,
          },
        ]}
        card={OrderCard}
      />
    </Stack>
  );
};
