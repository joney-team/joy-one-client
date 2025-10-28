"use client";

import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { StatusColumn } from "@/components/list/columns/status-column";
import { CustomerColumn } from "@/modules/customers/components/customer-column";
import { EventType } from "@/modules/events/event-types";
import { getClientLocale } from "@/modules/lang/lang-service";
import { OnModalProductCombo } from "@/modules/product-combos/modals/modal-product-combo";
import { productComboStatusOptions } from "@/modules/product-combos/product-combos-service";
import { ProductComboStatus } from "@/modules/product-combos/product-combos-types";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@lingui/core/macro";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { IconHistory, IconPackage } from "@tabler/icons-react";
import { type FC } from "react";
import { productComboStatuses } from "./product-combos-constants";
import { ProductComboEntity } from "./product-combos-entity";

export const ProductComboList: FC = () => {
  const color = useColor();

  return (
    <Stack p={16}>
      <List<ProductComboEntity>
        id="cbs"
        icon={IconPackage}
        name={t`List combos`}
        route="/product-combos"
        columns={{
          customerId: CustomerColumn({ valuePath: "customer" }),
          createdAt: DateTimeColumn({ valuePath: "createdAt" }),
          product: {
            name: "name",
            render: ({ value }) => value?.name,
          },
          productRefs: {
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
          status: StatusColumn({
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
            onClick: (data) => OnModalProductCombo({ id: data.id }),
          },
        ]}
        events={[EventType.PRODUCT_COMBO_UPDATE]}
      />
    </Stack>
  );
};
