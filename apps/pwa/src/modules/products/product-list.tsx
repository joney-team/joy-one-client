"use client";

import { Clickable } from "@/components/clickable";
import { EntityImage } from "@/components/entity-image";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { EventType } from "@/graphql/enums.graphql";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Trans } from "@lingui/react/macro";
import { Badge, Stack, Text } from "@mantine/core";
import { IconBox, IconBuildingWarehouse, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryType } from "../categories/category-types";
import { CategoryColumn } from "../categories/components/category-column";
import { getProductIcon } from "./products-service";

import QUERY_PRODUCTS from "./graphql/queryProducts.graphql";

export const ProductList: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductEntity>
        id="prods"
        name={<Trans>Products</Trans>}
        icon={IconBox}
        query={QUERY_PRODUCTS}
        fixedParams={{ type: ProductType.PRODUCT }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.PRODUCT }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          image: {
            defaultWidth: 100,
            name: <Trans>Image</Trans>,
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
            name: <Trans>Name</Trans>,
            defaultWidth: 350,
            render: ({ data }) => {
              return (
                <Clickable
                  permission={WorkspacePermission.PRODUCTS_SERVICES_WRITE}
                  onClick={() => OnProductModal({ product: data })}
                >
                  {data.name}
                </Clickable>
              );
            },
          },
          code: codeColumn({ defaultHidden: true }),
          categoryId: CategoryColumn({ type: CategoryType.PRODUCTS }),
          stock: {
            defaultWidth: 200,
            name: <Trans>Product stocks</Trans>,
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
                  {data.stock.quantity <= 0 ? (
                    <Trans>Out of stock</Trans>
                  ) : (
                    <NumberFormat value={data.stock.quantity ?? 0} />
                  )}
                </Badge>
              );
            },
          },
          unit: {
            defaultWidth: 150,
            name: <Trans>Unit</Trans>,
          },
          price: {
            defaultWidth: 250,
            align: "right",
            sortable: true,
            name: <Trans>Price</Trans>,
            render: ({ data }) => {
              if (data.minPrice && data.maxPrice) {
                return (
                  <Text>
                    <CurrencyFormat value={data.minPrice} /> -{" "}
                    <CurrencyFormat value={data.maxPrice} />
                  </Text>
                );
              }

              return (
                <Text>
                  <CurrencyFormat value={data.price} />
                </Text>
              );
            },
          },
        }}
        card={({ data }) => <ProductCard product={data} />}
        events={[EventType.ProductNew, EventType.ProductUpdate, EventType.ProductArchived]}
        actions={[
          {
            label: <Trans>Edit</Trans>,
            icon: IconEdit,
            permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
            onClick: (data) => OnProductModal({ product: data }),
          },
        ]}
      />
    </Stack>
  );
};
