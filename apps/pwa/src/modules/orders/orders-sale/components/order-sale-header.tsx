"use client";

import { WorkspaceLayoutSidebarCollapseButton } from "@/components/workspace-layout-sidebar-collapse-button";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Group } from "@mantine/core";
import type { FC } from "react";
import { OrderSaleActions } from "./order-sale-actions";
import { OrderSaleSearchBox } from "./order-sale-search-box";
import { OrderSaleTabs } from "./order-sale-tabs";
import { useLayout } from "@/layout/layout-context";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";

export const OrderSaleHeader: FC = () => {
  const color = useColor();
  const { view } = useLayout();

  if (view === "mobile") {
    return (
      <Group
        w="100%"
        component="header"
        h={workspaceLayoutConfig.headerHeight}
        bg={color("primary")}
        pr={8}
        pos="sticky"
        top={0}
        style={{ zIndex: 1 }}
        gap={4}
      >
        <Group pl={8}>
          <ActionIcon component={Link} href="/orders">
            <IconHome strokeWidth={1.5} />
          </ActionIcon>
        </Group>

        <OrderSaleTabs />
        <OrderSaleActions />
      </Group>
    );
  }

  return (
    <Group
      px={8}
      w="100%"
      component="header"
      h={workspaceLayoutConfig.headerHeight}
      bg={color("primary")}
      pos="sticky"
      top={0}
      style={{ zIndex: 1 }}
    >
      <Group w="100%" h="100%" px={8}>
        <WorkspaceLayoutSidebarCollapseButton variant="subtle" color="white" />
        <OrderSaleSearchBox />
        <OrderSaleTabs />
        <OrderSaleActions />
      </Group>
    </Group>
  );
};
