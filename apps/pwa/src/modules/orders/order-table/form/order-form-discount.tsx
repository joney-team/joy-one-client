import { Button } from "@/components/buttons/button";
import { num, t } from "@/modules/lang/lang-service";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { useOrderTable } from "../order-table-context";

export const OrderFormDiscounts: FC = () => {
  const orderForm = useOrderTable();

  return (
    <Group justify="space-between">
      <Group gap={5}>
        <Text>{t("discounts")}</Text>

        {orderForm.values.directDiscount && orderForm.values.directDiscount > 0 ? (
          <Button
            rightIcon={IconPencil}
            iconSpacing={-8}
            size="compact-xs"
            variant="subtle"
            onClick={orderForm.onDirectDiscount}
          >
            {t("direct")}: {num(orderForm.values.directDiscount, { type: "money" })}
          </Button>
        ) : (
          <Button leftIcon={IconPlus} size="compact-xs" variant="subtle" onClick={orderForm.onDirectDiscount}>
            {t("direct_discount")}
          </Button>
        )}
      </Group>

      <Group gap={8}>
        {orderForm.isCalculating ? (
          <Skeleton h={20} w={80} visible={orderForm.isCalculating} />
        ) : (
          <Text>{num(orderForm.totalDiscountAmount, { type: "money" })}</Text>
        )}
      </Group>
    </Group>
  );
};
