"use client";

import { EntityImage } from "@/components/entity-image";
import { Column } from "@/components/list/types";
import { ProductType } from "@/graphql/enums.graphql";
import { AppEntity } from "@/types";
import { Anchor, Group, Stack, Text } from "@mantine/core";
import { IconBox } from "@tabler/icons-react";
import Link from "next/link";
import { ReactNode } from "react";
import { searchEntity } from "../../search/search-service";
import { ProductFragment } from "../graphql/fragmentProduct.graphql";
import GetProductsDocument from "../graphql/getProducts.graphql";
import GetProductsByIdsDocument from "../graphql/getProductsByIds.graphql";
import { productTypes } from "../products-constants";

type ProductColumnType = Pick<ProductFragment, "_id" | "name" | "image" | "type"> | null;

export interface ProductColumnArgs<T extends ProductColumnType> extends Omit<Column, "render"> {
  extraInfos?: (value: T) => ReactNode;
  type?: ProductType | ProductType[];
}

export const ProductColumn = <T extends ProductColumnType>(
  args?: ProductColumnArgs<T>,
): Column<any, T> => {
  return {
    icon: IconBox,
    name: args?.name || "product",
    render: ({ value }) => {
      if (!value) return "--";

      const { icon: Icon } = productTypes[value.type];

      return (
        <Anchor component={Link} href={`/products/${value._id}`} className="link">
          <Group gap={8} wrap="nowrap">
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
        listQuery: GetProductsDocument,
        listParams: args?.type ? { type: args?.type } : undefined,
        getSelectedOptions: async (ids: string[], client) => {
          const options = await client.query({
            query: GetProductsByIdsDocument,
            variables: {
              ids,
            },
          });
          return (options.data?.getProductsByIds ?? []).map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        search: async (query, client) => {
          const result = await searchEntity(AppEntity.PRODUCTS, query, {
            type: args?.type,
          });
          const options = await client.query({
            query: GetProductsByIdsDocument,
            variables: {
              ids: result.map((v) => v.id),
            },
          });
          return (options.data?.getProductsByIds ?? []).map((v) => ({
            label: v.name,
            value: v._id,
            data: v,
          }));
        },
        render: ({ data }) => {
          const { icon: Icon } = productTypes[data.type as ProductType];

          return (
            <Group gap={8} wrap="nowrap" className="clickable">
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
