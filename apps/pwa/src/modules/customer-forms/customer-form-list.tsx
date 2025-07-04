import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { StatusColumn } from "@/components/list/columns/status-column";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { renderLocation } from "@/modules/locations/locations-service";
import { OnModalUpdateWorkspaceBranch } from "@/modules/workspace-branches/modals/modal-update-workspace-branch";
import { WorkspaceBranchColumn } from "@/modules/workspace-branches/workspace-branch-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { IconBuildingSkyscraper, IconLink } from "@tabler/icons-react";
import { type FC } from "react";
import { OnCustomerFormModal } from "../customers/modals/modal-customer";
import { CustomerFormEntity } from "./customer-form-entity";
import { customerFormStatusConfigs, multiArchiveCustomerForm } from "./customer-form-service";
import { OnModalCustomerForm } from "./modal-customer-form";
import { Stack } from "@mantine/core";

export const CustomerFormList: FC = () => {
  return (
    <Stack p={16}>
      <List<CustomerFormEntity>
        id="cfms"
        route="/customer-forms"
        creatable={{
          onCreate: () => OnModalCustomerForm(),
          label: t("link_form"),
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
          location: {
            w: 400,
            name: "address",
            render: ({ value }) => renderLocation(value),
          },
          workspaceBranchId: WorkspaceBranchColumn({
            w: 320,
            onChange: (data) => {
              if (!data) return;
              OnModalUpdateWorkspaceBranch({
                customerForms: [data],
                workspaceBranch: data.workspaceBranch,
              });
            },
          }),
          status: StatusColumn({
            w: 200,
            options: Object.entries(customerFormStatusConfigs).map(([key, value]) => ({
              value: key,
              label: t(value.label),
              color: value.color,
            })),
          }),
        }}
        events={[
          EventType.CUSTOMER_FORM_NEW,
          EventType.CUSTOMER_FORM_UPDATED,
          EventType.CUSTOMER_FORM_ARCHIVED,
        ]}
        multipleSelectActions={[
          {
            label: "move_workspace_branch",
            icon: IconBuildingSkyscraper,
            permission: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
            handler: (data, ctx) =>
              OnModalUpdateWorkspaceBranch({
                customerForms: data,
                onComplete: ctx.unSelect,
                workspaceBranch: data[0].workspaceBranch,
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
