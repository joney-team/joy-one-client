"use client";

import { Column } from "@/components/list/types";
import { getCustomerByIds } from "@/modules/customers/customer-service";
import { tl } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { IconCategory } from "@tabler/icons-react";
import { CategoryType } from "../category-types";

export interface CategoryColumnArgs<Data = any> extends Omit<Column<Data>, "render"> {
  type?: CategoryType;
}

export function CategoryColumn<T = any>(args?: CategoryColumnArgs<T>): Column {
  return {
    icon: IconCategory,
    name: args?.name || "category",
    valuePath: args?.valuePath || "category.name",
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
        render: ({ data }) => data.name,
      },
    },
    exportToExcel: (data) => {
      return [
        {
          col: tl("name"),
          text: data.name,
        },
      ];
    },
    ...args,
  };
}
