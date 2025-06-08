import { Column } from "@/components/list/types";
import { Anchor, Group, Stack, Text } from "@mantine/core";
import { IconBox } from "@tabler/icons-react";
import Link from "next/link";
import { ReactNode } from "react";
import { ProductEntity, ProductType } from "./products-types";
import { getProductByIds, getProductIcon, getProducts } from "./products-service";
import { EntityImage } from "@/components/entity-image";
import { searchEntity } from "../search/search-service";
import { AppEntity } from "@/types";

export interface ProductColumnArgs extends Omit<Column, "render"> {
  extraInfos?: (value: ProductEntity) => ReactNode;
  type?: ProductType | ProductType[];
}

export const ProductColumn = (args?: ProductColumnArgs): Column => {
  return {
    icon: IconBox,
    name: args?.name || "product",
    render: ({ value }) => {
      if (!value) return "--";

      const Icon = getProductIcon(value.type);

      return (
        <Anchor component={Link} href={`/products/${value._id}`} className="link">
          <Group gap={8}>
            <EntityImage src={value.image} icon={Icon} size={40} radius={8} />
            <Stack gap={0}>
              <Text fz={16} fw={500}>
                {value.name}
              </Text>
              {args?.extraInfos?.(value)}
            </Stack>
          </Group>
        </Anchor>
      );
    },
    filter: {
      dynamicSelector: {
        ...args?.filter,
        multiple: true,
        getInitialOptions: async () => {
          const options = await getProducts({
            limit: 5,
            type: args?.type,
            sort: "sortLastInteractionAt:-1",
          });

          return options.data.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        getOptions: async (ids: string[]) => {
          const options = await getProductByIds(ids);
          return options.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        search: async (query) => {
          const result = await searchEntity(AppEntity.PRODUCTS, query, {
            type: args?.type,
          });
          const options = await getProductByIds(result.map((v) => v._id));
          return options.map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        render: ({ data }) => {
          const Icon = getProductIcon(data.type);

          return (
            <Group gap={8} className="clickable">
              <EntityImage src={data.image} icon={Icon} size={40} radius={8} />
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
    ...args,
  };
};
