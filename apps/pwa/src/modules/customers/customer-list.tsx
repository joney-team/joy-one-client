import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/CodeColumn";
import { DateTimeColumn } from "@/components/list/columns/DateTimeColumn";
import { EnumColumn } from "@/components/list/columns/EnumColumn";
import { CustomerCard } from "@/modules/customers/customer-card";
import { OnCustomerModal } from "@/modules/customers/customer-modal";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Gender } from "@/types";
import { Stack } from "@mantine/core";
import { IconGenderBigender, IconMail, IconPhone, IconUserSquare } from "@tabler/icons-react";
import { type FC } from "react";
import { customerGenderOptions } from "./customer-service";
import { CustomerEntity } from "./customer-types";

export const CustomerList: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <List<CustomerEntity>
        id="cus"
        name="customers"
        icon={IconUserSquare}
        route="/customers"
        columns={{
          code: CodeColumn({ href: (value) => `/customers/${value}` }),
          createdAt: DateTimeColumn({ name: "createdAt", isSortable: true, isHasFilter: true }),
          avatar: {
            w: 120,
            align: "center",
            render: ({ data }) => <Avatar customer={data} size={50} radius={8} />,
            exportToExcel: false,
          },
          gender: EnumColumn({
            icon: IconGenderBigender,
            options: Object.values(Gender).map((gender) => ({
              label: t(`gender_${gender}`),
              value: gender,
              color: customerGenderOptions[gender].color,
              icon: customerGenderOptions[gender].icon,
            })),
          }),
          name: {
            exportToExcel: (value) => {
              return {
                text: value,
                width: 35,
              };
            },
          },
          phone: {
            icon: IconPhone,
            filter: { text: true },
            disabled: !workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT),
            exportToExcel: (value) => {
              return {
                text: value,
                width: 20,
              };
            },
          },
          email: {
            icon: IconMail,
            filter: { text: true },
            exportToExcel: (value) => {
              return {
                text: value,
                width: 30,
              };
            },
          },
        }}
        card={({ data }) => <CustomerCard customer={data} />}
        creatable={{
          onCreate: () => OnCustomerModal(),
          permission: WorkspacePermission.CUSTOMERS_CREATE,
        }}
        events={[EventType.CUSTOMER_NEW, EventType.CUSTOMER_UPDATED, EventType.CUSTOMER_ARCHIVED]}
      />
    </Stack>
  );
};
