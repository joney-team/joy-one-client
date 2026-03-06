"use client";

import { Avatar } from "@/components/avatar";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { genders } from "@/constant";
import { EventType } from "@/graphql/enums.graphql";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Gender } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import {
  IconEye,
  IconGenderBigender,
  IconMail,
  IconPhone,
  IconPhoto,
  IconUserSquare,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Fragment, useRef, type FC } from "react";
import { workspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { useWorkspace } from "../workspaces/workspace-context";
import { type ModalCustomerRef } from "./customer-modal";

import { CustomerDataFragment } from "./graphql/fragmentCustomer.graphql";
import QUERY_CUSTOMERS from "./graphql/queryCustomers.graphql";

const ModalCustomer = dynamic(
  () => import("@/modules/customers/customer-modal").then((res) => res.ModalCustomer),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const CustomerList: FC = () => {
  const workspace = useWorkspace();
  const modalCustomerRef = useRef<ModalCustomerRef>(null);

  return (
    <Fragment>
      <Stack p={16}>
        <List<CustomerDataFragment>
          id="cus"
          name={<Trans>Customers</Trans>}
          icon={IconUserSquare}
          query={QUERY_CUSTOMERS}
          columns={{
            code: codeColumn({ href: (value) => `/customers/${value}` }),
            createdAt: dateTimeColumn({
              name: <Trans>Created at</Trans>,
              sortable: true,
              isHasFilter: true,
            }),
            avatar: {
              icon: IconPhoto,
              name: <Trans>Avatar</Trans>,
              align: "center",
              render: ({ data }) => <Avatar customer={data} size={50} radius={8} />,
              exportToExcel: false,
              defaultWidth: 120,
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

                if (!data.phone) return null;

                return <Clickable href={`tel:${data.phone}`}>{data.phone}</Clickable>;
              },
              exportToExcel: (value) => {
                return {
                  text: value ?? "",
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
                  text: value ?? "",
                  width: 30,
                };
              },
            },
            workspaceBranchId: workspaceBranchColumn(),
          }}
          card={({ data }) => <CustomerCard customer={data} />}
          creatable={{
            onCreate: () => modalCustomerRef.current?.open(),
            permission: WorkspacePermission.CUSTOMERS_CREATE,
          }}
          actions={[
            {
              label: <Trans>Detail</Trans>,
              icon: IconEye,
              href: (data) => `/customers/${data.code}`,
            },
          ]}
          events={[
            EventType.CustomerNew,
            EventType.CustomerUpdated,
            EventType.CustomerArchived,
            EventType.CustomerBulkUpdateWorkspaceBranch,
          ]}
        />
      </Stack>

      <ModalCustomer ref={modalCustomerRef} />
    </Fragment>
  );
};
