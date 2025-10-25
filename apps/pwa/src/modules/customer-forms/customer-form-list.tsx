"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { StatusColumn } from "@/components/list/columns/status-column";
import { EventType } from "@/modules/events/event-types";
import { OnModalUpdateWorkspaceBranch } from "@/modules/workspace-branches/modals/modal-update-workspace-branch";
import { WorkspaceBranchColumn } from "@/modules/workspace-branches/workspace-branch-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity } from "@/types";
import { Stack } from "@mantine/core";
import { IconBuildingSkyscraper, IconLink } from "@tabler/icons-react";
import { type FC } from "react";
import { OnCustomerFormModal } from "../customers/modals/modal-customer-form";
import { CustomerFormEntity } from "./customer-form-entity";
import { multiArchiveCustomerForm } from "./customer-form-service";
import { OnModalCustomerForm } from "./modal-customer-form";
import { useLocations } from "../locations/locations-context";
import { t } from "@lingui/core/macro";
import { customerFormStatuses } from "./customer-form-constants";

export const CustomerFormList: FC = () => {
  const { renderVnLocation: renderLocation } = useLocations();
  return (
    <Stack p={16}>
      <List<CustomerFormEntity>
        id="cfms"
        route="/customer-forms"
        creatable={{
          onCreate: () => OnModalCustomerForm(),
          label: t`Link form`,
          icon: IconLink,
        }}
        columns={{
          name: {
            filter: { text: true },
            render: ({ value, data }) => {
              return <Clickable onClick={() => OnCustomerFormModal(data)}>{value}</Clickable>;
            },
          },
          phone: {
            filter: { text: true },
            render: ({ value, data }) => {
              return <Clickable onClick={() => OnCustomerFormModal(data)}>{value}</Clickable>;
            },
          },
          vnLocation: {
            w: 400,
            name: "address",
            render: ({ value }) => renderLocation(value),
          },
          workspaceBranchId: WorkspaceBranchColumn({
            w: 320,
            entity: AppEntity.CUSTOMER_FORMS,
          }),
          status: StatusColumn({
            w: 200,
            options: Object.entries(customerFormStatuses).map(([key, value]) => ({
              value: key,
              label: value.label(),
              color: value.color,
            })),
          }),
        }}
        events={[
          EventType.CUSTOMER_FORM_NEW,
          EventType.CUSTOMER_FORM_UPDATED,
          EventType.CUSTOMER_FORM_ARCHIVED,
        ]}
        bulkActions={[
          {
            label: t`Move branch`,
            icon: IconBuildingSkyscraper,
            permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
            handler: (data, ctx) =>
              OnModalUpdateWorkspaceBranch({
                entity: AppEntity.CUSTOMER_FORMS,
                ids: data.map((v) => v._id),
                onComplete: ctx.unSelect,
              }),
          },
          {
            permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
            type: "archive",
            handler: (data) => multiArchiveCustomerForm(data.map((v) => v._id)),
          },
        ]}
      />
    </Stack>
  );
};
