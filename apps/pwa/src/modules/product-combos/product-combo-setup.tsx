"use client";

import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { numberColumn } from "@/components/list/columns/number-column";
import { EventType, ProductType } from "@/graphql/enums.graphql";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductEntity } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Badge, em, Group, Stack, Text } from "@mantine/core";
import { IconEditCircle, IconSettings } from "@tabler/icons-react";
import { type FC } from "react";

import { Trans } from "@lingui/react/macro";
import QUERY_PRODUCT_COMBOS from "./graphql/queryProductCombos.graphql";

export const ProductComboSetup: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductEntity>
        id="cbsetup"
        icon={IconSettings}
        name={<Trans>List combos</Trans>}
        query={QUERY_PRODUCT_COMBOS}
        fixedParams={{ type: ProductType.Combo }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.Combo }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          name: { name: <Trans>Name</Trans> },
          unit: { name: <Trans>Unit</Trans> },
          combos: {
            name: <Trans>Products/Services</Trans>,
            render: ({ value }) => {
              if (!value) return null;

              return (
                <Stack gap={5}>
                  {value.map((combo, i) => {
                    return (
                      <Group key={i} gap={5}>
                        <Text fz={em(15)} c="var(--mantine-color-text)" fw={500}>
                          • {combo.product.name}
                        </Text>

                        <Badge variant="light" color="var(--mantine-color-text)">
                          x<NumberFormat value={combo.quantity} />
                        </Badge>
                      </Group>
                    );
                  })}
                </Stack>
              );
            },
          },
          price: numberColumn({ type: "money", name: <Trans>Price</Trans>, sortable: true }),
        }}
        card={(props) => <ProductCard product={props.data} />}
        actions={[
          {
            label: <Trans>Edit</Trans>,
            icon: IconEditCircle,
            onClick: (data) => OnProductModal({ type: data.type, product: data }),
          },
        ]}
        events={[EventType.ProductNew, EventType.ProductUpdate, EventType.ProductArchived]}
      />
    </Stack>
  );
};
