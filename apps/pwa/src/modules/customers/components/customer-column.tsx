"use client";

import { Avatar } from "@/components/avatar";
import { Column } from "@/components/list/types";
import { useRouter } from "@/hooks/use-router";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconUserSquareRounded } from "@tabler/icons-react";
import { searchEntity } from "../../search/search-service";
import { WorkspacePermission } from "../../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../../workspaces/workspace-context";
import GetCustomersDocument from "../graphql/getCustomers.graphql";
import GetCustomersByIdsDocument from "../graphql/getCustomersByIds.graphql";

export interface CustomerColumnArgs<Data = any> extends Omit<Column<Data>, "render"> {}

export function customerColumn<T = any>(args?: CustomerColumnArgs<T>): Column {
  return {
    icon: IconUserSquareRounded,
    name: args?.name || <Trans>Customer</Trans>,
    defaultWidth: args?.defaultWidth || 230,
    render: ({ value }) => {
      const { t } = useLingui();
      const router = useRouter();
      const workspace = useWorkspace();
      const name = value?.name || t`Guest`;

      return (
        <Group
          gap={8}
          w="100%"
          className={value ? "clickable" : ""}
          wrap="nowrap"
          onClick={value ? () => router.push(`/customers/${value.code}`) : undefined}
          miw={0}
        >
          <Avatar icon={IconUserSquareRounded} customer={value} size={40} radius={8} />
          <Stack gap={0} flex={1} miw={0}>
            <Tooltip label={name} disabled={name.length < 22}>
              <Text fw={500} truncate maw={180}>
                {name}
              </Text>
            </Tooltip>

            {value?.phone &&
              workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                <Text fz={14} c="gray" truncate>
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
        listQuery: GetCustomersDocument,
        multiple: true,
        getSelectedOptions: async (ids: string[], client) => {
          const results = await client.query({
            query: GetCustomersByIdsDocument,
            variables: {
              ids,
            },
          });
          return (results.data?.customers ?? []).map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        search: async (query, client) => {
          const result = await searchEntity(AppEntity.CUSTOMERS, query);
          const results = await client.query({
            query: GetCustomersByIdsDocument,
            variables: {
              ids: result.map((v) => v.id),
            },
            fetchPolicy: "network-only",
          });
          return (results.data?.customers ?? []).map((v) => ({
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
          col: t`Name`,
          text: customer.name,
        },
        {
          col: t`Phone`,
          text: customer.phone,
        },
      ];
    },
    ...args,
  };
}
