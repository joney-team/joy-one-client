"use client";

import { useLayout } from "@/layout/layout-context";
import { ActionIcon, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { FC } from "react";
import { OrderTableProps } from "..";
import { OrderTableSearch } from "./order-table-search";

export const OrderTableHead: FC<OrderTableProps> = (props) => {
  const layout = useLayout();

  return (
    <Group w="100%">
      <Group gap={8} wrap="nowrap" w="100%">
        <ActionIcon w={38} h={38} radius={100} color="gray" variant="subtle" onClick={props.onExit}>
          <IconChevronLeft size={25} strokeWidth={1.5} />
        </ActionIcon>

        <Group
          style={
            layout.view === "mobile"
              ? {
                  flex: 1,
                }
              : {
                  maxWidth: "100%",
                  width: 500,
                }
          }
        >
          <OrderTableSearch />
        </Group>
      </Group>
    </Group>
  );
};
