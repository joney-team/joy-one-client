import { Column } from "@/components/list/types";
import { Group, Stack, Text } from "@mantine/core";
import { IconUserSquareRounded } from "@tabler/icons-react";
import { useWorkspace } from "../workspaces/workspace-context";
import { useRouter } from "@/hooks/use-router";
import { Avatar } from "@/components/avatar";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { t } from "../lang/lang-service";
import { getCustomerByIds, getCustomers } from "./customer-service";
import { searchEntity } from "../search/search-service";
import { AppEntity } from "@/types";

export interface CustomerColumnArgs<Data = any> extends Omit<Column<Data>, "render"> {}

export function CustomerColumn<T = any>(args?: CustomerColumnArgs<T>): Column {
  return {
    icon: IconUserSquareRounded,
    name: args?.name || "customer",
    render: ({ value }) => {
      const router = useRouter();
      const workspace = useWorkspace();

      return (
        <Group
          gap={8}
          className={value ? "clickable" : ""}
          onClick={value ? () => router.push(`/customers/${value.code}`) : undefined}
        >
          <Avatar icon={IconUserSquareRounded} customer={value} size={40} radius={8} />
          <Stack gap={0}>
            <Text fz={16} fw={500}>
              {value?.name || t("guest")}
            </Text>
            {value?.phone && workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
              <Text fz={14} c="gray">
                {value.phone}
              </Text>
            )}
          </Stack>
        </Group>
      );
    },
    filter: {
      dynamicSelector: {
        ...args?.filter,
        multiple: true,
        getInitialOptions: async () => {
          const options = await getCustomers({
            limit: 5,
            sort: "lastInteractionAt:desc",
          });

          return options.data.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        getOptions: async (ids: string[]) => {
          const options = await getCustomerByIds(ids);
          return options.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        search: async (query) => {
          const result = await searchEntity(AppEntity.CUSTOMERS, query);
          const options = await getCustomerByIds(result.map((v) => v._id));
          return options.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        render: ({ data }) => {
          return (
            <Group gap={8} className="clickable">
              <Avatar customer={data} size="sm" radius={8} />
              <Stack gap={0}>
                <Text fz={14} fw={500}>
                  {data.name}
                </Text>
                {data.phone && (
                  <Text fz={10} c="gray">
                    {data.phone}
                  </Text>
                )}
              </Stack>
            </Group>
          );
        },
      },
    },
    exportToExcel: (customer) => {
      return [
        {
          col: t("name"),
          text: customer.name,
        },
        {
          col: t("phone"),
          text: customer.phone,
        },
      ];
    },
    ...args,
  };
}
