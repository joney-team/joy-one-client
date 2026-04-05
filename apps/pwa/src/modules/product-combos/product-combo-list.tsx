"use client";

import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { EventType, ProductComboStatus } from "@/graphql/enums.graphql";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { getClientLocale } from "@/modules/lang/lang-service";
import { ModalProductCombo } from "@/modules/product-combos/modals/modal-product-combo";
import { useColor } from "@/modules/theme/use-color";
import { Group, Stack, Text } from "@mantine/core";
import { IconHistory, IconPackage } from "@tabler/icons-react";
import { type FC } from "react";
import { productComboStatuses } from "./product-combos-constants";

import { Badge } from "@/components/badge";
import { Trans, useLingui } from "@lingui/react/macro";
import { ProductComboFragment } from "./graphql/fragmentProductCombo.graphql";
import GetProductCombosDocument from "./graphql/getProductCombos.graphql";

export const ProductComboList: FC = () => {
  const color = useColor();
  const { t } = useLingui();

  return (
    <Stack p="md">
      <ModalProductCombo>
        {(openProductCombo) => {
          return (
            <List<ProductComboFragment>
              id="cbs"
              icon={IconPackage}
              name={<Trans>List combos</Trans>}
              query={GetProductCombosDocument}
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
                    const statusOptions = productComboStatuses[data.status];

                    return value?.map((ref) => {
                      return (
                        <Group key={ref.productRefId} gap={8}>
                          <Text fz={16} c="var(--mantine-color-text)" fw={400}>
                            • {ref.product.name}
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
                            `${v.product.name} (${(v.quantity - v.quantityUsed).toLocaleString(
                              getClientLocale(),
                            )}/${v.quantity.toLocaleString(getClientLocale())})`,
                        )
                        .join("\n"),
                    };
                  },
                },
                status: statusColumn({
                  options: Object.values(ProductComboStatus).map((status) => ({
                    label: t(productComboStatuses[status].label),
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
