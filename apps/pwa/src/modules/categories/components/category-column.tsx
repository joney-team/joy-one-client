import { Column } from "@/components/list/types";
import { useQuery } from "@/modules/apis/use-query";
import { getCustomerByIds } from "@/modules/customers/customer-service";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity, ResponseList } from "@/types";
import { IconCategory } from "@tabler/icons-react";
import { CategoryEntity, CategoryType } from "../category-types";

export interface CategoryColumnArgs<Data = any> extends Omit<Column<Data>, "render"> {
  type?: CategoryType;
}

export function CategoryColumn<T = any>(args?: CategoryColumnArgs<T>): Column {
  const categoryInitOptions = useQuery<ResponseList<CategoryEntity>>({
    route: "/categories",
    params: {
      limit: 9,
      sort: "lastInteractionAt:desc",
      type: args?.type,
    },
  });

  return {
    icon: IconCategory,
    name: args?.name || "category",
    valuePath: args?.valuePath || "category",
    render: ({ value }) => value?.name,
    filter: {
      dynamicSelector: {
        ...args?.filter,
        multiple: true,
        initOptions:
          categoryInitOptions.data?.data.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          })) || [],
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
          col: t("name"),
          text: data.name,
        },
      ];
    },
    ...args,
  };
}
