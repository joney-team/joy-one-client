"use client";

import { NumberFormat } from "@/components/format/number-format";
import { Column } from "@/components/list/types";
import { Trans } from "@lingui/react/macro";
import { Text } from "@mantine/core";
import { IconStack2 } from "@tabler/icons-react";
import { OrderFragment } from "./graphql/fragmentOrder.graphql";

export const OrderItemsColumn: Column<OrderFragment, OrderFragment["items"]> = {
  name: <Trans>Products/Services</Trans>,
  defaultWidth: 300,
  icon: IconStack2,
  valuePath: "items",
  render: ({ data }) => {
    return (
      <Text>
        <NumberFormat value={data.items.length} />
      </Text>
    );
  },
};
