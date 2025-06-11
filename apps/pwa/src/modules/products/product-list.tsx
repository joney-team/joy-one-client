"use client";

import { type FC } from "react";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { useRouter } from "@/hooks/use-router";
import { EventType } from "@/modules/events/event-types";
import { num, t } from "@/modules/lang/lang-service";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductCard } from "@/modules/products/product-card";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Badge, Stack, Text } from "@mantine/core";
import { IconBox, IconBuildingWarehouse, IconEdit, IconEye } from "@tabler/icons-react";

export const ProductList: FC = () => {
  const router = useRouter();

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
          name: {
            render: ({ data }) => {
              return (
                <Clickable onClick={() => router.push(`/products/${data._id}`)}>
                  <Text>{data.name}</Text>
                </Clickable>
              );
            },
          },
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
                  {data.stock.quantity <= 0 ? t("out_of_stock") : num(data.stock.quantity)}
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
            isSortable: true,
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
        events={[
          EventType.PRODUCT_NEW,
          EventType.PRODUCT_UPDATE,
          EventType.PRODUCT_ARCHIVED,

          EventType.PRODUCT_STOCK_IN,
          EventType.PRODUCT_STOCK_IN_REVERT,
          EventType.PRODUCT_STOCK_OUT,
          EventType.PRODUCT_STOCK_OUT_REVERT,
          EventType.PRODUCT_STOCK_IN_MULTIPLE,
        ]}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            onClick: (data) => OnProductModal({ type: ProductType.PRODUCT, product: data }),
          },
          {
            label: "view",
            icon: IconEye,
            onClick: (data) => router.push(`/products/${data._id}`),
          },
        ]}
      />
    </Stack>
  );
};
