import { useLayout } from "@/layout/layout-context";
import { Group, ScrollArea, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { FC } from "react";
import { OrderTableHead } from "./components/order-table-head";
import { OrderTableProducts } from "./components/order-table-products";
import { OrderTableTrackOrders } from "./components/order-table-track-orders";
import { OrderForm } from "./form/order-form";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { backgroundColors } from "@/layout/layout-workspace";

export interface OrderTableProps {
  size: {
    w: number;
    h: number;
  };
  onExit?: () => void;
  onCloseOrder?: () => void;
}

export const OrderTable: FC<OrderTableProps> = (props) => {
  const layout = useLayout();
  const leftSideSize = useElementSize();
  const mobileFormSize = useElementSize();
  const colorScheme = useColorScheme();
  const backgroundColor = backgroundColors[colorScheme];

  if (layout.view === "mobile") {
    return (
      <Stack {...props.size} style={{ position: "relative" }} gap={0}>
        <Stack px={16} pt={16}>
          <OrderTableHead {...props} />
        </Stack>

        <Stack flex={1} ref={mobileFormSize.ref}>
          <OrderForm {...props} size={{ w: mobileFormSize.width, h: mobileFormSize.height }} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Group
      bg={backgroundColor}
      flex={1}
      gap={0}
      align="start"
      style={{ position: "relative", overflow: "hidden" }}
      {...props.size}
    >
      <ScrollArea
        flex={1}
        h={props.size.h}
        scrollbars="y"
        type="never"
        viewportProps={{ id: "order-table-scroll-container" }}
      >
        <Stack p={16} pb={200} ref={leftSideSize.ref}>
          <OrderTableHead {...props} />
          <OrderTableProducts {...props} />
        </Stack>
      </ScrollArea>

      <OrderTableTrackOrders w={leftSideSize.width} />

      <OrderForm {...props} />
    </Group>
  );
};
