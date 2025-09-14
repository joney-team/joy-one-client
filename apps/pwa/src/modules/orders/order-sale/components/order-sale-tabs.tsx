"use client";

import { Circle } from "@/components/circle";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Box, Divider, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { Fragment, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

const config = {
  borderRadius: 8,
  tabHeight: `calc(100% - 6px)`,
};

interface SaleTabProps {
  active?: boolean;
  name: string;
  onClose: () => void;
  onClick: () => void;
  hideDivider?: boolean;
  dotColor?: string;
}

const SaleTab: FC<SaleTabProps> = (props) => {
  const color = useColor();
  const bg = props.active ? color("bg") : "transparent";
  const hovered = useHover();

  return (
    <Group
      h="100%"
      align="end"
      gap={0}
      className="clickable unselectable"
      ref={hovered.ref}
      onClick={props.onClick}
    >
      {props.active && (
        <Box h={config.tabHeight} w={config.borderRadius} bg={bg} pos="relative">
          <Box
            h="100%"
            w="100%"
            bg={color("primary")}
            pos="absolute"
            top={0}
            left={0}
            style={{
              borderBottomRightRadius: config.borderRadius,
            }}
          />
        </Box>
      )}
      <Group
        bg={bg}
        h={config.tabHeight}
        style={{
          borderTopLeftRadius: config.borderRadius,
          borderTopRightRadius: config.borderRadius,
        }}
        pl={12}
        pr={8}
        gap={8}
      >
        <Group w={10} justify="center" align="center">
          <Circle size={8} bg={color(props.dotColor ?? "primary.3")} />
        </Group>
        <Text
          fz={14}
          fw={500}
          c={props.active ? "dark" : "white"}
          truncate="end"
          maw={props.active ? undefined : 40}
        >
          {props.name}
        </Text>
        <ActionIcon
          variant="subtle"
          size="xs"
          color={props.active ? "gray" : "gray.3"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.onClose();
          }}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
      {props.active ? (
        <Box h={config.tabHeight} w={config.borderRadius} bg={bg} pos="relative">
          <Box
            h="100%"
            w="100%"
            bg={color("primary")}
            pos="absolute"
            top={0}
            left={0}
            style={{
              borderBottomLeftRadius: config.borderRadius,
            }}
          />
        </Box>
      ) : (
        <Fragment>
          {!props.hideDivider && (
            <Stack h={config.tabHeight} justify="center">
              <Divider orientation="vertical" h="30%" opacity={0.5} />
            </Stack>
          )}
        </Fragment>
      )}
    </Group>
  );
};

export const OrderSaleTabs: FC = () => {
  const orderSale = userOrdersManagement();
  const orderActiveIndex = orderSale.orders.findIndex((o) => o.id === orderSale.activeOrderId);
  const orderCount = orderSale.orders.length;

  return (
    <Group h={workspaceLayoutConfig.headerHeight} align="end" gap={0} flex={1}>
      {orderSale.orders.map((order, index) => (
        <SaleTab
          key={order.id}
          name={order.code ?? `#${index + 1} ${t("order")} `}
          active={order.id === orderSale.activeOrderId}
          onClose={() => orderSale.closeOrder()}
          onClick={() => orderSale.setActiveOrderId(order.id)}
          hideDivider={index === orderActiveIndex - 1}
          dotColor={!order.isSaved || order.isDirty ? "orange.3" : "primary.3"}
        />
      ))}

      {orderCount < 8 && (
        <Stack h={config.tabHeight} justify="center" px={10}>
          <Tooltip label={t("create_entity", { entity: t("order") })}>
            <ActionIcon onClick={() => orderSale.addOrder()} size="lg">
              <IconCirclePlus size={20} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      )}
    </Group>
  );
};
