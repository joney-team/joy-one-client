"use client";

import { Avatar } from "@/components/avatar";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { genders } from "@/constant";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { OnCustomerModal } from "@/modules/customers/customer-modal";
import { EventType } from "@/modules/events/event-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity, Gender } from "@/types";
import { Stack } from "@mantine/core";
import {
  IconGenderBigender,
  IconMail,
  IconPhone,
  IconPhoto,
  IconUserSquare,
} from "@tabler/icons-react";
import { type FC } from "react";
import { WorkspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { useWorkspace } from "../workspaces/workspace-context";
import { CustomerEntity } from "./customer-types";
import { t } from "@lingui/core/macro";

export const CustomerList: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <List<CustomerEntity>
        id="cus"
        name={t`Customers`}
        icon={IconUserSquare}
        route="/customers"
        columns={{
          code: CodeColumn({ href: (value) => `/customers/${value}` }),
          createdAt: DateTimeColumn({ name: t`Created at`, sortable: true, isHasFilter: true }),
          avatar: {
            name: t`Avatar`,
            w: 100,
            align: "center",
            render: ({ data }) => <Avatar customer={data} size={50} radius={8} />,
            exportToExcel: false,
          },
          gender: EnumColumn({
            name: t`Gender`,
            icon: IconGenderBigender,
            options: Object.values(Gender).map((gender) => ({
              label: genders[gender].name(),
              value: gender,
              color: genders[gender].color,
              icon: genders[gender].icon,
            })),
          }),
          name: {
            name: t`Name`,
            exportToExcel: (value) => {
              return {
                text: value,
                width: 35,
              };
            },
          },
          phone: {
            name: t`Phone`,
            icon: IconPhone,
            filter: workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT)
              ? { text: true }
              : undefined,
            render: ({ data }) => {
              if (!workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT)) {
                return data.phone;
              }

              return <Clickable href={`tel:${data.phone}`}>{data.phone}</Clickable>;
            },
            exportToExcel: (value) => {
              return {
                text: value,
                width: 20,
              };
            },
          },
          email: {
            name: t`Email`,
            icon: IconMail,
            filter: { text: true },
            exportToExcel: (value) => {
              return {
                text: value,
                width: 30,
              };
            },
          },
          workspaceBranchId: WorkspaceBranchColumn({
            entity: AppEntity.CUSTOMERS,
          }),
        }}
        card={({ data }) => <CustomerCard customer={data} />}
        creatable={{
          onCreate: () => OnCustomerModal(),
          permission: WorkspacePermission.CUSTOMERS_CREATE,
        }}
        events={[
          EventType.CUSTOMER_NEW,
          EventType.CUSTOMER_UPDATED,
          EventType.CUSTOMER_ARCHIVED,
          EventType.CUSTOMER_BULK_UPDATE_WORKSPACE_BRANCH,
        ]}
      />
    </Stack>
  );
};
