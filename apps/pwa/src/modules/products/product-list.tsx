"use client";

import { Clickable } from "@/components/clickable";
import { EntityImage } from "@/components/entity-image";
import { List } from "@/components/list";
import { EventType } from "@/modules/events/event-types";
import { num, tl } from "@/modules/lang/lang-service";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Badge, Stack, Text } from "@mantine/core";
import { IconBox, IconBuildingWarehouse, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryType } from "../categories/category-types";
import { CategoryColumn } from "../categories/components/category-column";
import { getProductIcon } from "./products-service";
import { CodeColumn } from "@/components/list/columns/code-column";

export const ProductList: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductEntity>
        id="prods"
        name="products"
        icon={IconBox}
        route="/products"
        params={{ type: ProductType.PRODUCT }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.PRODUCT }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          image: {
            w: 100,
            align: "center",
            render: ({ data }) => {
              return (
                <EntityImage
                  src={data.image}
                  icon={getProductIcon(data.type)}
                  size={50}
                  radius={8}
                />
              );
            },
          },
          name: {
            render: ({ data }) => {
              return (
                <Clickable
                  permission={WorkspacePermission.PRODUCTS_SERVICES_WRITE}
                  onClick={() => OnProductModal({ product: data })}
                >
                  <Text>{data.name}</Text>
                </Clickable>
              );
            },
          },
          code: CodeColumn({ defaultHidden: true }),
          categoryId: CategoryColumn({ type: CategoryType.PRODUCTS }),
          stock: {
            w: 150,
            name: "product_stocks",
            render: ({ data }) => {
              if (!data.isStockCheck) return "-";
              return (
                <Badge
                  leftSection={<IconBuildingWarehouse size={16} strokeWidth={1.5} />}
                  size="lg"
                  fw={700}
                  variant={data.stock.quantity > 0 ? "light" : "outline"}
                  color={data.stock.quantity <= 0 ? "gray" : undefined}
                >
                  {data.stock.quantity <= 0 ? tl("out_of_stock") : num(data.stock.quantity)}
                </Badge>
              );
            },
          },
          unit: {
            w: 150,
          },
          price: {
            w: 250,
            align: "right",
            sortable: true,
            render: ({ data }) => {
              if (data.minPrice && data.maxPrice) {
                return (
                  <Text>
                    {num(data.minPrice)} - {num(data.maxPrice, { type: "money" })}
                  </Text>
                );
              }

              return <Text>{num(data.price, { type: "money" })}</Text>;
            },
          },
        }}
        card={({ data }) => <ProductCard product={data} />}
        events={[EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED]}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
            onClick: (data) => OnProductModal({ product: data }),
          },
        ]}
      />
    </Stack>
  );
};
