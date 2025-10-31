"use client";

import { Clickable } from "@/components/clickable";
import { EntityImage } from "@/components/entity-image";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { EventType } from "@/modules/events/event-types";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge, Stack, Text } from "@mantine/core";
import { IconBox, IconBuildingWarehouse, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryType } from "../categories/category-types";
import { CategoryColumn } from "../categories/components/category-column";
import { getProductIcon } from "./products-service";

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
            name: t`Image`,
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
            name: t`Product stocks`,
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
            w: 150,
            name: t`Unit`,
          },
          price: {
            w: 250,
            align: "right",
            sortable: true,
            name: t`Price`,
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
        events={[EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED]}
        actions={[
          {
            label: t`Edit`,
            icon: IconEdit,
            permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
            onClick: (data) => OnProductModal({ product: data }),
          },
        ]}
      />
    </Stack>
  );
};
