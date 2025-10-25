"use client";

import { List } from "@/components/list";
import { NumberColumn } from "@/components/list/columns/number-column";
import { EventType } from "@/modules/events/event-types";
import { num, tl, tMulti } from "@/modules/lang/lang-service";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductCard } from "@/modules/products/components/product-card";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Badge, em, Group, Stack, Text } from "@mantine/core";
import { IconEditCircle, IconSettings } from "@tabler/icons-react";
import { type FC } from "react";

export const ProductComboSetup: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductEntity>
        id="cbsetup"
        icon={IconSettings}
        name={tMulti(["list"], ["combos"])}
        route="/products"
        params={{ type: ProductType.COMBO }}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.COMBO }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          name: {},
          unit: {},
          combos: {
            name: `${tl("products")}/${tl("services")}`,
            render: ({ value }) => {
              if (!value) return null;

              return (
                <Stack gap={5}>
                  {value.map((combo, i) => {
                    return (
                      <Group key={i} gap={5}>
                        <Text fz={em(15)} c="var(--mantine-color-text)" fw={500}>
                          • {combo.product.name}
                        </Text>

                        <Badge variant="light" color="var(--mantine-color-text)">
                          x{num(combo.quantity)}
                        </Badge>
                      </Group>
                    );
                  })}
                </Stack>
              );
            },
          },
          price: NumberColumn({ type: "money", name: tl("price"), sortable: true }),
        }}
        card={(props) => <ProductCard product={props.data} />}
        actions={[
          {
            label: "edit",
            icon: IconEditCircle,
            onClick: (data) => OnProductModal({ type: data.type, product: data }),
          },
        ]}
        events={[EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED]}
      />
    </Stack>
  );
};
