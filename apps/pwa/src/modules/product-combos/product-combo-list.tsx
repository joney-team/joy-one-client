"use client";

import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { getClientLocale } from "@/modules/lang/lang-service";
import { ModalProductCombo } from "@/modules/product-combos/modals/modal-product-combo";
import { productComboStatusOptions } from "@/modules/product-combos/product-combos-service";
import { ProductComboStatus } from "@/modules/product-combos/product-combos-types";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@lingui/core/macro";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { IconHistory, IconPackage } from "@tabler/icons-react";
import { type FC } from "react";
import { productComboStatuses } from "./product-combos-constants";
import { ProductComboEntity } from "./product-combos-entity";
import { EventType } from "@/graphql/enums.graphql";

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
              name={t`List combos`}
              route="/product-combos"
              columns={{
                customerId: customerColumn({ name: t`Customer`, valuePath: "customer" }),
                createdAt: dateTimeColumn({ name: t`Time`, valuePath: "createdAt" }),
                product: {
                  name: t`Name`,
                  render: ({ data }) => data.product.name,
                },
                productRefs: {
                  name: t`Products/Services`,
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
                  label: t`History`,
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
