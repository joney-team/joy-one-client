"use client";

import { WorkspaceLayoutSidebarCollapseButton } from "@/components/workspace-layout-sidebar-collapse-button";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { useColor } from "@/modules/theme/use-color";
import { Group } from "@mantine/core";
import type { FC } from "react";
import { OrderSaleActions } from "./order-sale-actions";
import { OrderSaleSearchBox } from "./order-sale-search-box";
import { OrderSaleTabs } from "./order-sale-tabs";

export const OrderSaleHeader: FC = () => {
  const color = useColor();

  return (
    <Group
      px={8}
      w="100%"
      component="header"
      h={workspaceLayoutConfig.headerHeight}
      bg={color("primary")}
    >
      <Group w="100%" px={8}>
        <WorkspaceLayoutSidebarCollapseButton variant="subtle" color="white" />
        <OrderSaleSearchBox />
        <OrderSaleTabs />
        <OrderSaleActions />
      </Group>
    </Group>
  );
};
