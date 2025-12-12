"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useRestQuery } from "@/modules/apis/use-rest-query";
import { useEventsListener } from "@/modules/events/event-service";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { PromotionEntity } from "@/modules/promotions/promotions-types";
import { ModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { ResponseList } from "@/types";
import { onArchive } from "@/utils/actions";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { readLocalStorageValue, useLocalStorage, UseStorageOptions } from "@mantine/hooks";
import { useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo, useState, type FC } from "react";
import { v4 as uuid } from "uuid";
import { OrderCalculateDto } from "../orders-dtos";
import {
  archiveOrder,
  createOrder,
  getOrderByCode,
  getOrderById,
  getOrderList,
  payOrder,
  updateOrder,
} from "../orders-service";
import { OrderEntityCalculated } from "../orders-types";
import { Context } from "./orders-management-context";
import type {
  Order,
  OrdersManagementContext,
  OrdersManagementState,
} from "./orders-management-types";
import { normalizeEntityToOrder, normalizeOrderForSubmission } from "./orders-management-utils";

const initialStorage: UseStorageOptions<OrdersManagementState> = {
  key: "orders-management",
  defaultValue: {
    orders: [],
    activeOrderId: "",
  },
};

const generateInitialOrderSale = (): Order => {
  return {
    id: uuid(),
    isSaved: false,
    items: [],
    assigneeUsers: [],
    createdAt: DateTime.toSeconds(new Date()),
  };
};

const getCurrentState = () => {
  return readLocalStorageValue<OrdersManagementState>(initialStorage);
};

interface OrdersManagementProps extends PropsWithChildren {}

export const OrdersManagementProvider: FC<OrdersManagementProps> = (props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code");
  const mode = searchParams.get("mode");

  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useLocalStorage<OrdersManagementState>(initialStorage);

  const initialize = async () => {
    let _state = getCurrentState();

    // Re-fetch orders
    const serverOrders = await getOrderList({ ids: _state.orders.map((v) => v.id) });
    _state.orders = _state.orders.map((o) => {
      const serverOrder = serverOrders.data.find((v) => v.id === o.id);
      return serverOrder ? normalizeEntityToOrder(serverOrder) : o;
    });

    // Order by code
    if (orderCode) {
      if (!_state.orders.some((o) => o.code === orderCode)) {
        const orderByCode = await getOrderByCode(orderCode).catch(() => null);
        if (orderByCode) _state.orders.push(normalizeEntityToOrder(orderByCode));
      }

      const order = _state.orders.find((o) => o.code === orderCode);
      if (order) _state.activeOrderId = order.id;
    }

    // New order
    if (mode === "new") {
      router.removeQuery("mode", true);
      let order = _state.orders.find((o) => !o.isSaved && o.items.length === 0);

      if (!order) {
        order = generateInitialOrderSale();
        _state.orders.push(order);
      }

      _state.activeOrderId = order.id;
    }

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

  const calculating = useRestQuery<OrderEntityCalculated, OrderCalculateDto>({
    route: "/orders/calculate",
    method: "post",
    isSkip: !activeOrder,
    params: activeOrder ? normalizeOrderForSubmission(activeOrder) : undefined,
  });

  const totalAmount = (calculating.data?.totalAmount ?? 0) - (calculating.data?.paidAmount ?? 0);

  const closeOrder = (id?: string | null) => {
    const _id = id ?? activeOrder?.id;
    const orderIndex = state.orders.findIndex((o) => o.id === _id);
    const order = state.orders[orderIndex];

    if (!order) return;
    if (order.code === orderCode) router.removeQuery("code");

    const nextActiveOrderId =
      state.orders[orderIndex + 1]?.id ?? state.orders[orderIndex - 1]?.id ?? state.orders[0]?.id;
    const orders = [...state.orders].filter((o) => o.id !== order.id);

    setState((s) => ({
      ...s,
      orders,
      activeOrderId: s.activeOrderId === order.id ? nextActiveOrderId : s.activeOrderId,
    }));
  };

  const removeOrder = async () => {
    if (!activeOrder) return;

    onArchive({
      name: activeOrder.code ? `${t`Order`} #${activeOrder.code}` : t`Order`,
      process: async () => {
        if (!activeOrder.isSaved) return Promise.resolve();
        await archiveOrder(activeOrder.id);
        closeOrder(activeOrder.id);
      },
    });
  };

  const fetchOrder = async (orderId: string) => {
    const order = await getOrderById(orderId);
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, ...normalizeEntityToOrder(order) } : o
      ),
    }));
  };

  const saveOrder = async () => {
    if (!activeOrder) return;
    if (!activeOrder.isSaved) {
      const order = await createOrder(normalizeOrderForSubmission(activeOrder));
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === activeOrder.id ? normalizeEntityToOrder(order) : o)),
      }));
    } else {
      const order = await updateOrder(activeOrder.id, normalizeOrderForSubmission(activeOrder));
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === activeOrder.id ? normalizeEntityToOrder(order) : o)),
      }));
    }
  };

  const availablePromotions = useRestQuery<ResponseList<PromotionEntity>>({
    isSkip: !activeOrder?.relatedCustomer?._id,
    route: `/promotions/customers/${activeOrder?.relatedCustomer?._id}`,
  });

  const availableCombos = useRestQuery<ProductComboEntity[]>({
    route: `/product-combos/customers/${activeOrder?.relatedCustomer?._id}`,
    isSkip: !activeOrder?.relatedCustomer?._id,
  });

  useEventsListener(
    [EventType.OrderSynced, EventType.OrderUpdated],
    (e) => {
      const relatedOrder = state.orders.find((o) => o.id === e.ref);
      if (relatedOrder) fetchOrder(relatedOrder.id);
    },
    [state.orders]
  );

  return (
    <ModalPayReceipt>
      {(modalPayReceipt) => {
        const handlePayOrder = async () => {
          if (!activeOrder || totalAmount === 0) return;
          if (!activeOrder.isSaved || activeOrder.isDirty) await saveOrder();

          const order = await getOrderById(activeOrder.id);

          const receipt = await payOrder(order.id, {
            amount: order.totalAmount - order.paidAmount,
          });

          modalPayReceipt.open({ receipt, onPaid: () => fetchOrder(activeOrder.id) });
        };

        const context: OrdersManagementContext = {
          isInitialized,
          orders: state.orders,
          availableCombos,
          availablePromotions,
          activeOrder,
          calculating,
          activeOrderId: state.activeOrderId,
          setActiveOrderId: (orderId) => {
            setState((s) => ({ ...s, activeOrderId: orderId }));
          },
          addOrder: (order) => {
            const _order = order ? normalizeEntityToOrder(order) : generateInitialOrderSale();
            _order.createdAt = DateTime.toSeconds(new Date());
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
              const price = product.minPrice
                ? (product.minPrice + product.price) / 2
                : product.price;
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
          payOrder: handlePayOrder,
          saveOrder,
        };

        return <Context.Provider value={context}>{props.children}</Context.Provider>;
      }}
    </ModalPayReceipt>
  );
};
