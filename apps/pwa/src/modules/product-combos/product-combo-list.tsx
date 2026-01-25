"use client";

import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { EventType } from "@/graphql/enums.graphql";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { getClientLocale } from "@/modules/lang/lang-service";
import { ModalProductCombo } from "@/modules/product-combos/modals/modal-product-combo";
import { productComboStatusOptions } from "@/modules/product-combos/product-combos-service";
import { ProductComboStatus } from "@/modules/product-combos/product-combos-types";
import { useColor } from "@/modules/theme/use-color";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { IconHistory, IconPackage } from "@tabler/icons-react";
import { type FC } from "react";
import { productComboStatuses } from "./product-combos-constants";
import { ProductComboEntity } from "./product-combos-entity";

import { Trans } from "@lingui/react/macro";
import QUERY_PRODUCT_COMBOS from "./graphql/queryProductCombos.graphql";

export const ProductComboList: FC = () => {
  const color = useColor();

  return (
    <Stack p={16}>
      <ModalProductCombo>
        {(openProductCombo) => {
          return (
            <List<ProductComboEntity>
              id="cbs"
              icon={IconPackage}
              name={<Trans>List combos</Trans>}
              query={QUERY_PRODUCT_COMBOS}
              columns={{
                customerId: customerColumn({
                  name: <Trans>Customer</Trans>,
                  valuePath: "customer",
                }),
                createdAt: dateTimeColumn({ name: <Trans>Time</Trans>, valuePath: "createdAt" }),
                product: {
                  name: <Trans>Name</Trans>,
                  render: ({ data }) => data.product.name,
                },
                productRefs: {
                  name: <Trans>Products/Services</Trans>,
                  render: ({ value, data }) => {
                    const statusOptions = productComboStatusOptions[data.status];

                    return value?.map((ref) => {
                      return (
                        <Group key={ref.productRefId} gap={8}>
                          <Text fz={16} c="var(--mantine-color-text)" fw={400}>
                            • {ref.productRef.name}
                          </Text>

                          <Badge variant="light" color={color(statusOptions.color)}>
                            <NumberFormat value={ref.quantity - ref.quantityUsed} />/
                            <NumberFormat value={ref.quantity} />{" "}
                          </Badge>
                        </Group>
                      );
                    });
                  },
                  exportToExcel: (productRefs) => {
                    return {
                      text: productRefs
                        .map(
                          (v) =>
                            `${v.productRef.name} (${(v.quantity - v.quantityUsed).toLocaleString(
                              getClientLocale()
                            )}/${v.quantity.toLocaleString(getClientLocale())})`
                        )
                        .join("\n"),
                    };
                  },
                },
                status: statusColumn({
                  options: Object.values(ProductComboStatus).map((status) => ({
                    label: productComboStatuses[status].label(),
                    value: status,
                    color: productComboStatuses[status].color,
                  })),
                }),
              }}
              actions={[
                {
                  label: <Trans>History</Trans>,
                  icon: IconHistory,
                  onClick: (data) => openProductCombo({ id: data.id }),
                },
              ]}
              events={[EventType.ProductComboUpdate]}
            />
          );
        }}
      </ModalProductCombo>
    </Stack>
  );
};
