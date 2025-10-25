"use client";

import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { NumberColumn } from "@/components/list/columns/number-column";
import { EventType } from "@/modules/events/event-types";
import { num } from "@/modules/lang/lang-service";
import { OnModalProductStockIn } from "@/modules/product-stocks/modals/modal-product-stock-in";
import { ProductStockRecordType } from "@/modules/product-stocks/product-stocks-types";
import { ProductColumn } from "@/modules/products/components/product-column";
import { ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Stack, Text } from "@mantine/core";
import { IconBuildingWarehouse } from "@tabler/icons-react";
import { type FC } from "react";
import { ProductStockEntity } from "./product-stocks-entity";

export const ProductStockList: FC = () => {
  return (
    <Stack p={16}>
      <List<ProductStockEntity>
        id="psks"
        icon={IconBuildingWarehouse}
        name="product_stocks"
        route="/product-stocks"
        columns={{
          createdAt: DateTimeColumn({ sortable: true, name: "time" }),
          productId: ProductColumn({
            type: ProductType.PRODUCT,
            valuePath: "product",
            extraInfos: (value) => {
              if (value.minPrice && value.maxPrice) {
                return (
                  <Text>
                    {t`Sale price`}: {num(value.minPrice, { type: "money" })} -{" "}
                    {num(value.maxPrice, { type: "money" })}
                  </Text>
                );
              }
              return (
                <Text>
                  {t`Sale price`}: {num(value.price, { type: "money" })}
                </Text>
              );
            },
          }),
          code: { name: "product_stock_code" },
          quantity: {
            sortable: true,
            render: ({ data }) => {
              return (
                <Text>
                  {num(data.remainQuantity)} / {num(data.quantity)}
                </Text>
              );
            },
          },
          expireAt: DateTimeColumn({ name: "expire_at", emptyText: "--", hideTime: true }),
          costPrice: NumberColumn({ name: "costPrice", type: "money" }),
          note: {},
        }}
        creatable={{
          onCreate: () => OnModalProductStockIn(),
          permission: WorkspacePermission.PRODUCT_STOCK_IN,
          label: `product_stock_record_type_${ProductStockRecordType.STOCK_IN}`,
        }}
        events={[
          EventType.PRODUCT_STOCK_IN,
          EventType.PRODUCT_STOCK_OUT,
          EventType.PRODUCT_STOCK_IN_MULTIPLE,
          EventType.PRODUCT_STOCK_IN_REVERT,
          EventType.PRODUCT_STOCK_OUT_REVERT,
        ]}
      />
    </Stack>
  );
};
