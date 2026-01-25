"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { statusColumn } from "@/components/list/columns/status-column";
import { EventType } from "@/graphql/enums.graphql";
import { ModalUpdateWorkspaceBranch } from "@/modules/workspace-branches/modals/modal-update-workspace-branch";
import { workspaceBranchColumn } from "@/modules/workspace-branches/workspace-branch-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconBuildingSkyscraper, IconLink, IconTrash } from "@tabler/icons-react";
import { type FC } from "react";
import { OnCustomerFormModal } from "../customers/modals/modal-customer-form";
import { useLocations } from "../locations/locations-context";
import { customerFormStatuses } from "./customer-form-constants";
import { CustomerFormEntity } from "./customer-form-entity";
import { multiArchiveCustomerForm } from "./customer-form-service";
import { OnModalCustomerForm } from "./modal-customer-form";

import QUERY_CUSTOMER_FORMS from "./graphql/queryCustomerForms.graphql";

export const CustomerFormList: FC = () => {
  const { renderVnLocation: renderLocation } = useLocations();
  return (
    <ModalUpdateWorkspaceBranch>
      {(modalUpdateWorkspaceBranch) => (
        <Stack p={16}>
          <List<CustomerFormEntity>
            id="cfms"
            query={QUERY_CUSTOMER_FORMS}
            creatable={{
              onCreate: () => OnModalCustomerForm(),
              label: t`Link form`,
              icon: IconLink,
            }}
            columns={{
              name: {
                name: t`Name`,
                filter: { text: true },
                render: ({ value, data }) => {
                  if (!value) return null;
                  return <Clickable onClick={() => OnCustomerFormModal(data)}>{value}</Clickable>;
                },
              },
              phone: {
                name: t`Phone`,
                filter: { text: true },
                render: ({ value, data }) => {
                  if (!value) return null;
                  return <Clickable onClick={() => OnCustomerFormModal(data)}>{value}</Clickable>;
                },
              },
              vnLocation: {
                defaultWidth: 400,
                name: t`Address`,
                render: ({ value }) => renderLocation(value),
              },
              workspaceBranchId: workspaceBranchColumn(),
              status: statusColumn({
                name: t`Status`,
                defaultWidth: 200,
                options: Object.entries(customerFormStatuses).map(([key, value]) => ({
                  value: key,
                  label: value.label(),
                  color: value.color,
                })),
              }),
            }}
            events={[
              EventType.CustomerFormNew,
              EventType.CustomerFormUpdated,
              EventType.CustomerFormArchived,
            ]}
            bulkActions={[
              {
                label: <Trans>Move branch</Trans>,
                icon: IconBuildingSkyscraper,
                permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
                handler: (data, ctx) =>
                  modalUpdateWorkspaceBranch.open({
                    entity: AppEntity.CUSTOMER_FORMS,
                    ids: data.map((v) => v._id),
                    onComplete: ctx.unSelect,
                  }),
              },
              {
                permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
                icon: IconTrash,
                label: <Trans>Archive</Trans>,
                type: "archive",
                handler: async (data, ctx) => {
                  await multiArchiveCustomerForm(data.map((v) => v._id));
                  ctx.refetch();
                },
              },
            ]}
          />
        </Stack>
      )}
    </ModalUpdateWorkspaceBranch>
  );
};
