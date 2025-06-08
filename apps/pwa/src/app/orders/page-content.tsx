import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/CodeColumn";
import { CustomerColumn } from "@/modules/customers/customer-column";
import { DateTimeColumn } from "@/components/list/columns/DateTimeColumn";
import { NumberColumn } from "@/components/list/columns/NumberColumn";
import { StatusColumn } from "@/components/list/columns/StatusColumn";
import { UserColumn } from "@/modules/users/user-column";
import { OrderCard } from "@/modules/orders/order-card";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { OnModalOrderTable } from "@/modules/orders/order-table/order-table-modal";
import { getOrders, onPayOrder, orderPaymentStatusOptions } from "@/modules/orders/orders-service";
import { OrderPaymentStatus } from "@/modules/orders/orders-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCalendarDown, IconCashRegister, IconEdit } from "@tabler/icons-react";
import { NextPage } from "next";
import { OrderItemsColumn } from "../../modules/orders/order-items-columns";

const Page: NextPage = () => {
  const workspace = useWorkspace();
  const mod = workspace.getModule("orders");

  if (!mod) return null;

  return (
    <List
      id="ors"
      name={mod.name}
      icon={mod.icon}
      fetch={(p) => getOrders(p)}
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
  );
};

export default Page;
