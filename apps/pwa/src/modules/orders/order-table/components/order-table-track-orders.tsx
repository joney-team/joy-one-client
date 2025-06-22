"use client";

import { Empty } from "@/components/empty";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { num, renderDate, renderTime, t } from "@/modules/lang/lang-service";
import { OrderEntity } from "@/modules/orders/order-entity";
import { getOrders } from "@/modules/orders/orders-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Period } from "@/types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { useList } from "@/utils/use-list.util";
import { Button, Card, Group, ScrollArea, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { FC, useState } from "react";
import { useOrderTable } from "../order-table-context";

export const OrderTableTrackOrders: FC<{ w: number }> = ({ w }) => {
  const workspace = useWorkspace();
  const mod = workspace.getModule("orders");

  const orderTable = useOrderTable();
  const color = useColor();

  const [isVisible, setIsVisible] = useState(true);

  const Icon = isVisible ? IconChevronUp : IconChevronDown;

  const orders = useList<OrderEntity>({
    id: "order-table-track-orders",
    fetch: (params) =>
      getOrders({
        ...params,
        sort: "createdAtDesc",
        timeRangeCreatedAt: `${Period.DATE}-${DateTimeUtils.timeToSeconds()}`,
        getAll: true,
      }),
  });

  useEventsListener(
    [
      EventType.ORDER_NEW,
      EventType.ORDER_UPDATED,
      EventType.ORDER_ARCHIVED,
      EventType.ORDER_SYNCED,
    ],
    () => orders.fetch(true, { isSilient: true })
  );

  if (!mod || orders.isEmpty) return null;

  return (
    <Stack
      style={{
        position: "absolute",
        bottom: 0,
        left: 16,
      }}
      w={w}
      gap={0}
      px={16}
    >
      <Group px={16 * 2}>
        <Button
          fz={14}
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          rightSection={<Icon size={16} style={{ marginLeft: -6 }} />}
          onClick={() => setIsVisible((s) => !s)}
        >
          {t("today_entity", { entity: mod.name })}
        </Button>
      </Group>

      {isVisible && (
        <Card
          w="100%"
          style={{
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: "0px -3px 8px rgba(0, 0, 0, 0.1)",
          }}
          p={0}
        >
          <ScrollArea.Autosize scrollbars="y" mah={220}>
            <Stack p={16}>
              {orders.isHasData && (
                <SimpleGrid cols={{ md: 3 }}>
                  {orders.data?.map((order) => {
                    const isActive = order.id === orderTable.order?.id;
                    return (
                      <Card
                        key={order.id}
                        withBorder
                        shadow="none"
                        className="unselectable"
                        style={{
                          cursor: "pointer",
                          borderColor: isActive ? color("primary") : undefined,
                        }}
                        onClick={() => orderTable.setOrder(order)}
                      >
                        <Group justify="space-between">
                          <Text fw={600}>{order.code}</Text>
                          <Text fz={16} c="gray" ta="right">
                            {renderDate(order.createdAt)}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text fz={16}>{num(order.totalAmount, { type: "money" })}</Text>
                          <Text fz={16} c="gray" ta="right">
                            {renderTime(order.createdAt)}
                          </Text>
                        </Group>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}

              <Empty visible={orders.isEmpty} />
            </Stack>
          </ScrollArea.Autosize>
        </Card>
      )}
    </Stack>
  );
};
