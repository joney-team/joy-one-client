"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { statusColumn } from "@/components/list/columns/status-column";
import { EventType } from "@/graphql/enums.graphql";
import { ModalUpdateWorkspaceBranch } from "@/modules/workspace-branches/modals/modal-update-workspace-branch";
import { workspaceBranchColumn } from "@/modules/workspace-branches/workspace-branch-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity } from "@/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconBuildingSkyscraper, IconLink, IconTrash } from "@tabler/icons-react";
import { type FC } from "react";
import { useLocations } from "../locations/locations-context";
import { customerFormStatuses } from "./customer-form-constants";
import { OnCustomerFormApprovalModal } from "./modals/modal-customer-form-approval";
import { OnModalCustomerFormLink } from "./modals/modal-customer-form-link";

import { useMutation } from "@apollo/client/react";
import BulkArchiveCustomerFormsDocument from "./graphql/bulkArchiveCustomerForms.graphql";
import { CustomerFormFragment } from "./graphql/fragmentCustomerForm.graphql";
import GetCustomerFormsDocument from "./graphql/getCustomerForms.graphql";

export const CustomerFormList: FC = () => {
  const { t } = useLingui();
  const { renderVnLocation: renderLocation } = useLocations();
  const [bulkArchiveCustomerForms] = useMutation(BulkArchiveCustomerFormsDocument);

  return (
    <ModalUpdateWorkspaceBranch>
      {(modalUpdateWorkspaceBranch) => (
        <Stack p="md">
          <List<CustomerFormFragment>
            id="cfms"
            query={GetCustomerFormsDocument}
            creatable={{
              onCreate: () => OnModalCustomerFormLink(),
              label: t`Link form`,
              icon: IconLink,
            }}
            columns={{
              name: {
                name: <Trans>Name</Trans>,
                filter: { text: true },
                render: ({ value, data }) => {
                  if (!value) return null;
                  return (
                    <Clickable onClick={() => OnCustomerFormApprovalModal(data)}>{value}</Clickable>
                  );
                },
              },
              phone: {
                name: <Trans>Phone</Trans>,
                filter: { text: true },
                render: ({ value, data }) => {
                  if (!value) return null;
                  return (
                    <Clickable onClick={() => OnCustomerFormApprovalModal(data)}>{value}</Clickable>
                  );
                },
              },
              vnLocation: {
                defaultWidth: 400,
                name: <Trans>Address</Trans>,
                render: ({ value }) => renderLocation(value),
              },
              workspaceBranch: workspaceBranchColumn(),
              status: statusColumn({
                name: <Trans>Status</Trans>,
                defaultWidth: 200,
                options: Object.entries(customerFormStatuses).map(([key, value]) => ({
                  value: key,
                  label: t(value.label),
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
                  await bulkArchiveCustomerForms({
                    variables: {
                      input: {
                        ids: data.map((v) => v._id),
                      },
                    },
                  });
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
