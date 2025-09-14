"use client";

import { Button } from "@/components/buttons/button";
import OverlayLoading from "@/components/overlay-loading";
import { useRouter } from "@/hooks/use-router";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { t } from "@/modules/lang/lang-service";
import { Group, Stack, Title } from "@mantine/core";
import { IconList, IconPlus } from "@tabler/icons-react";
import { type FC } from "react";
import { userOrdersManagement } from "../orders-management/orders-management-context";
import { OrdersManagementProvider } from "../orders-management/orders-management-provider";
import { OrderSaleCheckout } from "./components/order-sale-checkout";
import { OrderSaleHeader } from "./components/order-sale-header";
import { OrderSaleItems } from "./components/order-sale-items";

export const OrderSaleContent = () => {
  const router = useRouter();
  const { activeOrder, addOrder, isInitialized } = userOrdersManagement();

  if (!isInitialized) {
    return <OverlayLoading enabled />;
  }

  return (
    <Stack h="100dvh" gap={0}>
      <OrderSaleHeader />

      {activeOrder ? (
        <Group
          w="100%"
          h={`calc(100dvh - ${workspaceLayoutConfig.headerHeight}px)`}
          wrap="nowrap"
          gap={0}
        >
          <OrderSaleItems key={activeOrder.id + "items"} />
          <OrderSaleCheckout key={activeOrder.id + "checkout"} />
        </Group>
      ) : (
        <Stack flex={1} h="100%" justify="center" align="center">
          <Title fw={400} ta="center">
            {t("order_sale_title")}
          </Title>
          <Group justify="center" align="center">
            <Button
              variant="outline"
              color="gray"
              onClick={() => router.push("/orders")}
              leftIcon={IconList}
            >
              {t("list")}
            </Button>
            <Button onClick={() => addOrder()} leftIcon={IconPlus}>
              {t("create_entity", { entity: t("order") })}
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};

export const OrderSale: FC = () => {
  return (
    <OrdersManagementProvider autoCreateBlankOrder>
      <OrderSaleContent />
    </OrdersManagementProvider>
  );
};
