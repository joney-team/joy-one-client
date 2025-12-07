"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { EventType } from "@/graphql/enums.graphql";
import { ProductColumn } from "@/modules/products/components/product-column";
import { ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Stack, Text } from "@mantine/core";
import { IconBuildingWarehouse } from "@tabler/icons-react";
import { type FC } from "react";
import { ModalProductStockIn } from "./modals/modal-product-stock-in";
import { ProductStockEntity } from "./product-stocks-entity";

export const ProductStockList: FC = () => {
  return (
    <ModalProductStockIn>
      {(openStockIn) => (
        <Stack p={16}>
          <List<ProductStockEntity>
            id="psks"
            icon={IconBuildingWarehouse}
            name={<Trans>Stocks</Trans>}
            route="/product-stocks"
            columns={{
              createdAt: dateTimeColumn({ sortable: true, name: <Trans>Time</Trans> }),
              productId: ProductColumn({
                type: ProductType.PRODUCT,
                name: <Trans>Product</Trans>,
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
              code: codeColumn(),
              quantity: {
                sortable: true,
                name: <Trans>Quantity</Trans>,
                render: ({ data }) => {
                  return (
                    <Text>
                      <NumberFormat value={data.remainQuantity} /> /{" "}
                      <NumberFormat value={data.quantity} />
                    </Text>
                  );
                },
              },
              expireAt: dateTimeColumn({
                name: <Trans>Expire at</Trans>,
                emptyText: "--",
                hideTime: true,
              }),
              costPrice: numberColumn({ name: <Trans>Cost price</Trans>, type: "money" }),
              note: { name: <Trans>Note</Trans> },
            }}
            creatable={{
              onCreate: () => openStockIn(),
              permission: WorkspacePermission.PRODUCT_STOCK_IN,
              label: t`Stock in`,
            }}
            events={[
              EventType.ProductStockIn,
              EventType.ProductStockOut,
              EventType.ProductStockInMultiple,
              EventType.ProductStockInRevert,
              EventType.ProductStockOutRevert,
            ]}
          />
        </Stack>
      )}
    </ModalProductStockIn>
  );
};
