"use client";

import { useRouter } from "@/hooks/use-router";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { useQuery } from "@/modules/apis/use-query";
import { t, tMulti } from "@/modules/lang/lang-service";
import { onArchive } from "@/utils/actions";
import { timeToSeconds } from "@joy-one-client/utils/date-time";
import { Group, Stack } from "@mantine/core";
import { readLocalStorageValue, useLocalStorage, UseStorageOptions } from "@mantine/hooks";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FC } from "react";
import { v4 as uuid } from "uuid";
import { OrderCalculateDto } from "../orders-dtos";
import {
  archiveOrder,
  createOrder,
  getOrderByCode,
  getOrderById,
  getOrderList,
  onPayOrder,
  updateOrder,
} from "../orders-service";
import { OrderCalculated, OrderPaymentStatus } from "../orders-types";
import { OrderSaleCheckout } from "./components/order-sale-checkout";
import { OrderSaleHeader } from "./components/order-sale-header";
import { OrderSaleItems } from "./components/order-sale-items";
import { Context } from "./order-sale-context";
import type { OrderSaleContext, OrderSaleContextState, TOrderSale } from "./order-sale-types";
import { normalizeOrderSale, normalizeOrderSaleForCalculate } from "./order-sale-utils";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { onError } from "@/utils/exceptions.utils";

const initialStorage: UseStorageOptions<OrderSaleContextState> = {
  key: "order-sale",
  defaultValue: {
    orders: [],
    activeOrderId: "",
  },
};

const generateInitialOrderSale = (): TOrderSale => {
  return {
    id: uuid(),
    isSaved: false,
    items: [],
    assigneeUsers: [],
    createdAt: timeToSeconds(),
  };
};

const getCurrentState = () => {
  return readLocalStorageValue<OrderSaleContextState>(initialStorage);
};

export const OrderSale: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code");

  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useLocalStorage<OrderSaleContextState>(initialStorage);

  const initialize = async () => {
    let _state = getCurrentState();

    const serverOrders = await getOrderList({ ids: _state.orders.map((v) => v.id) });
    _state.orders = _state.orders.map((o) => {
      const serverOrder = serverOrders.data.find((v) => v.id === o.id);
      return serverOrder ? normalizeOrderSale(serverOrder) : o;
    });

    if (orderCode) {
      const order = _state.orders.find((o) => o.code === orderCode);
      if (order) _state.activeOrderId = order.id;
    }

    if (_state.orders.length === 0) _state.orders.push(generateInitialOrderSale());
    if (!_state.activeOrderId) _state.activeOrderId = _state.orders[0]?.id;
    setIsInitialized(true);
    setState(_state);
  };

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized]);

  const activeOrder = useMemo(() => {
    return state.orders.find((o) => o.id === state.activeOrderId) || null;
  }, [state.orders, state.activeOrderId]);

  const calculating = useQuery<OrderCalculated, OrderCalculateDto>({
    route: "/orders/calculate",
    method: "post",
    isSkip: !activeOrder,
    params: activeOrder ? normalizeOrderSaleForCalculate(activeOrder) : undefined,
  });

  const totalAmount = (calculating.data?.totalAmount ?? 0) - (calculating.data?.paidAmount ?? 0);

  const closeOrder = () => {
    if (!activeOrder) return;
    if (activeOrder.code === orderCode) router.removeQuery("code");

    const orders = [...state.orders].filter((o) => o.id !== activeOrder.id);

    setState((s) => ({
      ...s,
      orders,
      activeOrderId: s.activeOrderId === activeOrder.id ? orders[0]?.id : s.activeOrderId,
    }));
  };

  const removeOrder = async () => {
    if (!activeOrder) return;

    onArchive({
      name: activeOrder.code ? tMulti(["order"], [`#${activeOrder.code}`]) : t("order"),
      process: () => {
        if (!activeOrder.isSaved) return Promise.resolve();
        return archiveOrder(activeOrder.id);
      },
      onArchived: () => closeOrder(),
    });
  };

  const fetchOrder = async (orderId: string) => {
    const order = await getOrderById(orderId);
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, ...normalizeOrderSale(order) } : o)),
    }));
  };

  const saveOrder = async () => {
    if (!activeOrder) return;
    if (!activeOrder.isSaved) {
      const order = await createOrder(normalizeOrderSaleForCalculate(activeOrder));
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === activeOrder.id ? normalizeOrderSale(order) : o)),
      }));
    } else {
      const order = await updateOrder(activeOrder.id, normalizeOrderSaleForCalculate(activeOrder));
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === activeOrder.id ? normalizeOrderSale(order) : o)),
      }));
    }
  };

  const payOrder = async () => {
    if (!activeOrder || totalAmount === 0) return;
    if (!activeOrder.isSaved || activeOrder.isDirty) await saveOrder();
    const order = await getOrderById(activeOrder.id);
    await onPayOrder(order);
    await fetchOrder(activeOrder.id);
  };

  useEventsListener(
    [EventType.ORDER_SYNCED, EventType.ORDER_UPDATED],
    (e) => {
      const relatedOrder = state.orders.find((o) => o.id === e.ref);
      if (relatedOrder) fetchOrder(relatedOrder.id);
    },
    [state.orders]
  );

  const context: OrderSaleContext = {
    isInitialized,
    orders: state.orders,
    activeOrder,
    calculating,
    activeOrderId: state.activeOrderId,
    setActiveOrderId: (orderId) => {
      setState((s) => ({ ...s, activeOrderId: orderId }));
    },
    addOrder: (order) => {
      const _order = order ? normalizeOrderSale(order) : generateInitialOrderSale();
      _order.createdAt = timeToSeconds();
      setState((s) => ({ ...s, orders: [...s.orders, _order], activeOrderId: _order.id }));
    },
    addProduct: (product) => {
      let _state = getCurrentState();
      const orderIndex = _state.orders.findIndex((i) => i.id === state.activeOrderId);
      if (orderIndex === -1) return;

      const qtyPerUse = product.defaultQtyPerUse ?? 1;
      const isAlreadyAdded = _state.orders[orderIndex].items.some(
        (i) => i.product._id === product._id
      );

      if (isAlreadyAdded) {
        _state.orders[orderIndex].items = _state.orders[orderIndex].items.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + qtyPerUse } : i
        );
      } else {
        const price = product.minPrice ? (product.minPrice + product.price) / 2 : product.price;
        _state.orders[orderIndex].items.push({
          product,
          quantity: qtyPerUse,
          price,
          assigneeUsers: [],
        });
      }
      _state.orders[orderIndex].isDirty = true;
      setState(_state);
    },
    removeProduct: (productId) => {
      let _state = getCurrentState();
      const orderIndex = _state.orders.findIndex((i) => i.id === state.activeOrderId);
      if (orderIndex === -1) return;

      _state.orders[orderIndex].items = _state.orders[orderIndex].items.filter(
        (i) => i.product._id !== productId
      );
      _state.orders[orderIndex].isDirty = true;
      setState(_state);
    },
    updateProductItem: (productId, item) => {
      let _state = getCurrentState();
      const orderIndex = _state.orders.findIndex((i) => i.id === state.activeOrderId);
      if (orderIndex === -1) return;

      _state.orders[orderIndex].items = _state.orders[orderIndex].items.map((i) =>
        i.product._id === productId ? { ...i, ...item } : i
      );
      _state.orders[orderIndex].isDirty = true;
      setState(_state);
    },
    updateOrder: (value) => {
      let _state = getCurrentState();
      const orderIndex = _state.orders.findIndex((i) => i.id === state.activeOrderId);
      if (orderIndex === -1) return;

      _state.orders[orderIndex] = { ..._state.orders[orderIndex], ...value };
      _state.orders[orderIndex].isDirty = true;
      setState(_state);
    },
    closeOrder,
    removeOrder,
    payOrder,
    saveOrder,
  };

  return (
    <Context.Provider value={context}>
      <Stack h="100dvh" gap={0}>
        <OrderSaleHeader />

        {activeOrder && (
          <Group
            w="100%"
            h={`calc(100dvh - ${workspaceLayoutConfig.headerHeight}px)`}
            wrap="nowrap"
            gap={0}
          >
            <OrderSaleItems key={activeOrder.id + "items"} />
            <OrderSaleCheckout key={activeOrder.id + "checkout"} />
          </Group>
        )}
      </Stack>
    </Context.Provider>
  );
};
