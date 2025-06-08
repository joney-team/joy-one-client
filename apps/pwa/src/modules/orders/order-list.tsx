import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/CodeColumn";
import { DateTimeColumn } from "@/components/list/columns/DateTimeColumn";
import { NumberColumn } from "@/components/list/columns/NumberColumn";
import { StatusColumn } from "@/components/list/columns/StatusColumn";
import { CustomerColumn } from "@/modules/customers/customer-column";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { OrderCard } from "@/modules/orders/order-card";
import { OnModalOrderTable } from "@/modules/orders/order-table/order-table-modal";
import { onPayOrder, orderPaymentStatusOptions } from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { UserColumn } from "@/modules/users/user-column";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { IconCalendarDown, IconCashRegister, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { OrderItemsColumn } from "./order-items-columns";
import { OrderEntity } from "./order-entity";

export const OrderList: FC = () => {
  const workspace = useWorkspace();
  const mod = workspace.getModule("orders");

  if (!mod) return null;

  return (
    <Stack p={16}>
      <List<OrderEntity>
        id="ors"
        name={mod.name}
        icon={mod.icon}
        route="/orders"
        columns={{
          code: CodeColumn({ href: (value) => `/orders/${value}` }),
          createdAt: DateTimeColumn({ name: "time", isSortable: true }),
          relatedCustomerId: CustomerColumn({
            name: "customer",
            valuePath: "relatedCustomer",
          }),
          createdByUserId: UserColumn({
            name: "createdByUser",
            valuePath: "createdByUser",
          }),
          items: OrderItemsColumn,
          totalAmount: NumberColumn({ type: "money", isSortable: true }),
          paymentStatus: StatusColumn({
            w: 200,
            options: Object.values(OrderPaymentStatus).map((status) => ({
              label: t(`order_payment_status_${status}`),
              value: status,
              color: orderPaymentStatusOptions[status].color,
            })),
            rightSection: (order) => {
              if (order.paymentStatus === OrderPaymentStatus.PROCESSING) {
                return (
                  <Tooltip label={t("pay")}>
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
            name: t("today_entity", { entity: mod.name }),
            icon: IconCalendarDown,
            replaceFilterKeys: ["createdAt"],
            params: () => ({
              timeRangeCreatedAt: `date-${DateTimeUtils.timeToSeconds()}`,
            }),
          },
        ]}
        events={[EventType.ORDER_NEW, EventType.ORDER_UPDATED, EventType.ORDER_ARCHIVED, EventType.ORDER_SYNCED]}
        creatable={{
          onCreate: () => OnModalOrderTable(),
          permission: WorkspacePermission.ORDERS_CREATE,
        }}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            onClick: (data) => OnModalOrderTable({ order: data }),
          },
        ]}
        card={OrderCard}
      />
    </Stack>
  );
};
