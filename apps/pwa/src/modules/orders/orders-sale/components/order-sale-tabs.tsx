"use client";

import { Circle } from "@/components/circle";
import FlexContainer from "@/components/flex-container/flex-container";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { scrollToElementById } from "@joy-one-client/utils/scrollToElementById";
import { ActionIcon, Box, Divider, Group, Stack, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { Fragment, useEffect, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";
import { useOrderFeatureName } from "../../order-hooks";

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
  id: string;
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
      id={props.id}
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
        <Group gap={8}>
          <Circle size={8} bg={color(props.dotColor ?? "primary.3")} />
          <Text fz={14} fw={500} c={props.active ? "dark" : "white"}>
            {props.name}
          </Text>
        </Group>
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
  const orderFeatureName = useOrderFeatureName();

  useEffect(() => {
    if (orderSale.activeOrderId) {
      scrollToElementById(orderSale.activeOrderId + "-tab");
    }
  }, [orderSale.activeOrderId]);

  return (
    <FlexContainer hideScrollbars style={{ height: "100%" }}>
      <Group gap={0} w="max-content" wrap="nowrap" h="100%">
        {orderSale.orders.map((order, index) => (
          <SaleTab
            key={order.id}
            id={order.id + "-tab"}
            name={order.code ?? `#${index + 1} ${orderFeatureName.singular}`}
            active={order.id === orderSale.activeOrderId}
            onClose={() => orderSale.closeOrder(order.id)}
            onClick={() => orderSale.setActiveOrderId(order.id)}
            hideDivider={index === orderActiveIndex - 1}
            dotColor={!order.isSaved || order.isDirty ? "orange.3" : "primary.3"}
          />
        ))}
      </Group>
    </FlexContainer>
  );
};
