"use client";

import { Avatar } from "@/components/avatar";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { genders } from "@/constant";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { OnCustomerModal } from "@/modules/customers/customer-modal";
import { EventType } from "@/modules/events/event-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Gender } from "@/types";
import { t } from "@lingui/core/macro";
import { Stack } from "@mantine/core";
import {
  IconGenderBigender,
  IconMail,
  IconPhone,
  IconPhoto,
  IconUserSquare,
} from "@tabler/icons-react";
import { type FC } from "react";
import { workspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { useWorkspace } from "../workspaces/workspace-context";
import { CustomerEntity } from "./customer-types";
import { Trans } from "@lingui/react/macro";

export const CustomerList: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <List<CustomerEntity>
        id="cus"
        name={<Trans>Customers</Trans>}
        icon={IconUserSquare}
        route="/customers"
        columns={{
          code: codeColumn({ href: (value) => `/customers/${value}` }),
          createdAt: dateTimeColumn({
            name: <Trans>Created at</Trans>,
            sortable: true,
            isHasFilter: true,
          }),
          avatar: {
            icon: IconPhoto,
            resizable: false,
            name: <Trans>Avatar</Trans>,
            align: "center",
            minWidth: 80,
            render: ({ data }) => <Avatar customer={data} size={50} radius={8} />,
            exportToExcel: false,
          },
          gender: enumColumn({
            name: <Trans>Gender</Trans>,
            icon: IconGenderBigender,
            options: Object.values(Gender).map((gender) => ({
              label: genders[gender].name(),
              value: gender,
              color: genders[gender].color,
              icon: genders[gender].icon,
            })),
          }),
          name: {
            name: <Trans>Name</Trans>,
            exportToExcel: (value) => {
              return {
                text: value,
                width: 35,
              };
            },
          },
          phone: {
            name: <Trans>Phone</Trans>,
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
            name: <Trans>Email</Trans>,
            icon: IconMail,
            filter: { text: true },
            exportToExcel: (value) => {
              return {
                text: value,
                width: 30,
              };
            },
          },
          workspaceBranchId: workspaceBranchColumn(),
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
