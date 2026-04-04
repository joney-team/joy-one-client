"use client";

import { Clickable } from "@/components/clickable";
import { EntityImage } from "@/components/entity-image";
import { CurrencyFormat } from "@/components/format/currency-format";
import { List } from "@/components/list";
import { CategoryType, EventType, ProductType } from "@/graphql/enums.graphql";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Stack, Text } from "@mantine/core";
import { IconCategory2, IconEdit } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryColumn } from "../categories/components/category-column";

import { Trans } from "@lingui/react/macro";
import { ProductFragment } from "../products/graphql/fragmentProduct.graphql";
import GetProductsDocument from "../products/graphql/getProducts.graphql";
import { productTypes } from "../products/products-constants";

export const ServiceList: FC = () => {
  return (
    <Stack p="md">
      <List<ProductFragment>
        id="sers"
        name={<Trans>Services</Trans>}
        icon={IconCategory2}
        query={GetProductsDocument}
        fixedParams={{ type: ProductType.Service }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.Service }),
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
                  icon={productTypes[ProductType.Service].icon}
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
          categoryId: CategoryColumn({ type: CategoryType.Products }),
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
            onClick: (data) => OnProductModal({ product: data }),
          },
        ]}
      />
    </Stack>
  );
};
