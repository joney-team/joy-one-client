"use client";

import { WorkspaceLayoutSidebarCollapseButton } from "@/components/workspace-layout-sidebar-collapse-button";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { useColor } from "@/modules/theme/use-color";
import { Group } from "@mantine/core";
import { type FC } from "react";
import { OrderSaleSearchBox } from "./order-sale-search-box";
import { OrderSaleTabs } from "./order-sale-tabs";
import { OrderSaleActions } from "./order-sale-actions";

export const OrderSaleHeader: FC = () => {
  const color = useColor();

  return (
    <Group
      component="header"
      h={workspaceLayoutConfig.headerHeight}
      bg={color("primary")}
      w="100%"
      px={8}
    >
      <Group w="100%">
        <WorkspaceLayoutSidebarCollapseButton variant="subtle" color="white" />
        <OrderSaleSearchBox />
        <OrderSaleTabs />
        <OrderSaleActions />
      </Group>
    </Group>
  );
};
