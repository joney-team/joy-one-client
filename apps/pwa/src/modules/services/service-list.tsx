"use client";

import { Clickable } from "@/components/clickable";
import { EntityImage } from "@/components/entity-image";
import { CurrencyFormat } from "@/components/format/currency-format";
import { List } from "@/components/list";
import { EventType } from "@/graphql/enums.graphql";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Stack, Text } from "@mantine/core";
import { IconCategory2, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryType } from "../categories/category-types";
import { CategoryColumn } from "../categories/components/category-column";
import { getProductIcon } from "../products/products-service";

export const ServiceList: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductEntity>
        id="sers"
        name={t`Services`}
        icon={IconCategory2}
        route="/products"
        fixedParams={{ type: ProductType.SERVICE }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.SERVICE }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          image: {
            defaultWidth: 100,
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
            name: t`Name`,
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
          categoryId: CategoryColumn({ type: CategoryType.PRODUCTS }),
          unit: {
            defaultWidth: 150,
            name: t`Unit`,
          },
          price: {
            defaultWidth: 250,
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
        events={[EventType.ProductNew, EventType.ProductUpdate, EventType.ProductArchived]}
        actions={[
          {
            label: t`Edit`,
            icon: IconEdit,
            onClick: (data) => OnProductModal({ product: data }),
          },
        ]}
      />
    </Stack>
  );
};
