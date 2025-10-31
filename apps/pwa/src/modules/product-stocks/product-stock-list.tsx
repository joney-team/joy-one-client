"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { NumberColumn } from "@/components/list/columns/number-column";
import { EventType } from "@/modules/events/event-types";
import { OnModalProductStockIn } from "@/modules/product-stocks/modals/modal-product-stock-in";
import { ProductColumn } from "@/modules/products/components/product-column";
import { ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
        name={t`Stocks`}
        route="/product-stocks"
        columns={{
          createdAt: DateTimeColumn({ sortable: true, name: t`Time` }),
          productId: ProductColumn({
            type: ProductType.PRODUCT,
            name: t`Product`,
            valuePath: "product",
            extraInfos: (value) => {
              if (value.minPrice && value.maxPrice) {
                return (
                  <Text>
                    <Trans>Sale price</Trans>: <CurrencyFormat value={value.minPrice} /> -{" "}
                    <CurrencyFormat value={value.maxPrice} />
                  </Text>
                );
              }
              return (
                <Text>
                  <Trans>Sale price</Trans>: <CurrencyFormat value={value.price} />
                </Text>
              );
            },
          }),
          code: CodeColumn(),
          quantity: {
            sortable: true,
            name: t`Quantity`,
            render: ({ data }) => {
              return (
                <Text>
                  <NumberFormat value={data.remainQuantity} /> /{" "}
                  <NumberFormat value={data.quantity} />
                </Text>
              );
            },
          },
          expireAt: DateTimeColumn({ name: t`Expire at`, emptyText: "--", hideTime: true }),
          costPrice: NumberColumn({ name: t`Cost price`, type: "money" }),
          note: { name: t`Note` },
        }}
        creatable={{
          onCreate: () => OnModalProductStockIn(),
          permission: WorkspacePermission.PRODUCT_STOCK_IN,
          label: t`Stock in`,
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
