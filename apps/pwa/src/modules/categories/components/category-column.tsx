"use client";

import { Column } from "@/components/list/types";
import QUERY_CUSTOMERS_BY_IDS from "@/modules/customers/graphql/queryCustomersByIds.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { IconCategory } from "@tabler/icons-react";
import { CategoryType } from "../category-types";

export interface CategoryColumnArgs<Data = any> extends Omit<Column<Data>, "render"> {
  type?: CategoryType;
}

export function CategoryColumn<T = any>(args?: CategoryColumnArgs<T>): Column {
  return {
    icon: IconCategory,
    name: args?.name || <Trans>Category</Trans>,
    valuePath: args?.valuePath || "category.name",
    defaultWidth: 200,
    filter: {
      dynamicSelector: {
        ...args?.filter,
        multiple: true,
        listRoute: "/categories",
        listParams: args?.type
          ? {
              type: args.type,
            }
          : undefined,
        getSelectedOptions: async (ids: string[], client) => {
          const results = await client.query({
            query: QUERY_CUSTOMERS_BY_IDS,
            variables: {
              ids,
            },
          });

          return (results.data?.customersByIds ?? []).map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        search: async (query, client) => {
          const result = await searchEntity(AppEntity.CUSTOMERS, query);
          const results = await client.query({
            query: QUERY_CUSTOMERS_BY_IDS,
            variables: {
              ids: result.map((v) => v._id),
            },
          });
          return (results.data?.customersByIds ?? []).map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        render: ({ data }) => data.name,
      },
    },
    exportToExcel: (data) => {
      return [
        {
          col: t`Name`,
          text: data.name,
        },
      ];
    },
    ...args,
  };
}
