"use client";

import { Column } from "@/components/list/types";
import { CategoryType } from "@/graphql/enums.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { IconCategory } from "@tabler/icons-react";
import GetCategoriesDocument from "../graphql/getCategories.graphql";

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
        listQuery: GetCategoriesDocument,
        listParams: args?.type
          ? {
              type: args.type,
            }
          : undefined,
        getSelectedOptions: async (ids: string[], client) => {
          const results = await client.query({
            query: GetCategoriesDocument,
            variables: {
              ids,
            },
          });

          return (results.data?.list.results ?? []).map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        search: async (query, client) => {
          const result = await searchEntity(AppEntity.CATEGORIES, query);
          const results = await client.query({
            query: GetCategoriesDocument,
            variables: {
              ids: result.map((v) => v._id),
            },
          });
          return (results.data?.list.results ?? []).map((v) => ({
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
