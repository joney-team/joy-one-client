import { type FC } from "react";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/DateTimeColumn";
import { StatusColumn } from "@/components/list/columns/StatusColumn";
import { CustomerColumn } from "@/modules/customers/customer-column";
import { EventType } from "@/modules/events/event-types";
import { num, t, tMulti } from "@/modules/lang/lang-service";
import { OnModalProductCombo } from "@/modules/product-combos/modal-product-combo";
import { productComboStatusOptions } from "@/modules/product-combos/product-combos-service";
import { ProductComboStatus } from "@/modules/product-combos/product-combos-types";
import { useColor } from "@/modules/theme/use-color";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { IconHistory, IconPackage } from "@tabler/icons-react";
import { ProductComboEntity } from "./product-combos-entity";

export const ProductComboList: FC = () => {
  const color = useColor();

  return (
    <Stack p={16}>
      <List<ProductComboEntity>
        id="cbs"
        icon={IconPackage}
        name={tMulti(["list"], ["combos"])}
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
                      {num(ref.quantity - ref.quantityUsed)}/{num(ref.quantity)}
                    </Badge>
                  </Group>
                );
              });
            },
            exportToExcel: (productRefs) => {
              return {
                text: productRefs
                  .map((v) => `${v.productRef.name} (${num(v.quantity - v.quantityUsed)}/${num(v.quantity)})`)
                  .join("\n"),
              };
            },
          },
          status: StatusColumn({
            options: Object.values(ProductComboStatus).map((status) => ({
              label: t(`product_combo_status_${status}`),
              value: status,
              color: productComboStatusOptions[status].color,
            })),
          }),
        }}
        actions={[
          {
            label: "history",
            icon: IconHistory,
            onClick: (data) => OnModalProductCombo({ id: data.id }),
          },
        ]}
        events={[EventType.PRODUCT_COMBO_UPDATE]}
      />
    </Stack>
  );
};
