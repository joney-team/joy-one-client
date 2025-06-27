import { Avatar } from "@/components/avatar";
import { Column } from "@/components/list/types";
import { useRouter } from "@/hooks/use-router";
import { useQuery } from "@/modules/apis/use-query";
import { getCustomerByIds } from "@/modules/customers/customer-service";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity, ResponseList } from "@/types";
import { Group, Stack, Text } from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";
import { CategoryEntity } from "../category-types";

export interface CategoryColumnArgs<Data = any> extends Omit<Column<Data>, "render"> {}

export function CategoryColumn<T = any>(args?: CategoryColumnArgs<T>): Column {
  const categoryInitOptions = useQuery<ResponseList<CategoryEntity>>({
    route: "/categories",
    params: {
      limit: 5,
      sort: "lastInteractionAt:desc",
    },
  });

  return {
    icon: IconCategory,
    name: args?.name || "category",
    valuePath: args?.valuePath || "category",
    render: ({ value }) => {
      const router = useRouter();

      return (
        <Group
          gap={8}
          className={value ? "clickable" : ""}
          onClick={value ? () => router.push(`/categories/${value.code}`) : undefined}
        >
          <Stack gap={0}>
            <Text fz={16} fw={500}>
              {value?.name || t("category")}
            </Text>
          </Stack>
        </Group>
      );
    },
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
        render: ({ data }) => {
          return (
            <Group gap={8} className="clickable">
              <Stack gap={0}>
                <Text fz={14} fw={500}>
                  {data.name}
                </Text>
              </Stack>
            </Group>
          );
        },
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
