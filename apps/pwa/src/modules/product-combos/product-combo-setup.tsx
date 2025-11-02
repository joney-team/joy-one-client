"use client";

import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { numberColumn } from "@/components/list/columns/number-column";
import { EventType } from "@/modules/events/event-types";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Badge, em, Group, Stack, Text } from "@mantine/core";
import { IconEditCircle, IconSettings } from "@tabler/icons-react";
import { type FC } from "react";

export const ProductComboSetup: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductEntity>
        id="cbsetup"
        icon={IconSettings}
        name={t`List combos`}
        route="/products"
        fixedParams={{ type: ProductType.COMBO }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.COMBO }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          name: {},
          unit: {},
          combos: {
            name: `${t`Products`}/${t`Services`}`,
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
          price: numberColumn({ type: "money", name: t`Price`, sortable: true }),
        }}
        card={(props) => <ProductCard product={props.data} />}
        actions={[
          {
            label: t`Edit`,
            icon: IconEditCircle,
            onClick: (data) => OnProductModal({ type: data.type, product: data }),
          },
        ]}
        events={[EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED]}
      />
    </Stack>
  );
};
