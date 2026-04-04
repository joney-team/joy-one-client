"use client";

import { EventType, OrderPaymentStatus, OrderType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useEventsListener } from "@/modules/events/event-service";
import GetCustomerProductCombosDocument from "@/modules/product-combos/graphql/getCustomerProductCombos.graphql";
import GetAvailableCustomerPromotionsDocument from "@/modules/promotions/graphql/getAvailableCustomerPromotions.graphql";
import { ModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { onArchive } from "@/utils/actions";
import { useApolloClient, useLazyQuery, useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  readLocalStorageValue,
  useLocalStorage,
  UseStorageOptions,
  useThrottledCallback,
} from "@mantine/hooks";
import { useSearchParams } from "next/navigation";
import { Fragment, PropsWithChildren, useEffect, useMemo, useState, type FC } from "react";
import { v4 as uuid } from "uuid";
import ArchiveOrderDocument from "../graphql/archiveOrder.graphql";
import CalculateOrderDocument from "../graphql/calculateOrder.graphql";
import CreateOrderDocument from "../graphql/createOrder.graphql";
import GetOrderByCodeDocument from "../graphql/getOrderByCode.graphql";
import GetOrderByIdDocument from "../graphql/getOrderById.graphql";
import GetOrdersByIdsDocument from "../graphql/getOrdersByIds.graphql";
import PayOrderDocument from "../graphql/payOrder.graphql";
import UpdateOrderDocument from "../graphql/updateOrder.graphql";
import { Context } from "./orders-management-context";
import type {
  OrdersManagementContext,
  OrdersManagementState,
  OrderState,
} from "./orders-management-types";
import { normalizeOrderToInput } from "./orders-management-utils";

const initialStorage: UseStorageOptions<OrdersManagementState> = {
  key: "orders-management",
  defaultValue: {
    orders: [],
    activeOrderId: "",
  },
};

const generateInitialOrderSale = (): OrderState => {
  return {
    __typename: "Order",
    id: uuid(),
    type: OrderType.Common,
    assigneeUserIds: [],
    assigneeUsers: [],
    code: "",
    comboIds: [],
    createdAt: 0,
    isDirty: false,
    isSaved: false,
    createdByUser: null,
    discounts: [],
    isFulfilled: false,
    items: [],
    paidAmount: 0,
    promotionIds: [],
    relatedCustomer: null,
    paymentStatus: OrderPaymentStatus.Processing,
    totalAmount: 0,
    isArchived: false,
    note: null,
    relatedCustomerId: null,
    relatedUserIds: [],
    updatedAt: 0,
    workspaceBranchId: null,
    directDiscount: null,
    tipAmount: null,
  };
};

const getCurrentState = () => {
  return readLocalStorageValue<OrdersManagementState>(initialStorage);
};

interface OrdersManagementProps extends PropsWithChildren {}

export const OrdersManagementProvider: FC<OrdersManagementProps> = (props) => {
  const router = useRouter();
  const client = useApolloClient();

  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code");
  const mode = searchParams.get("mode");

  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useLocalStorage<OrdersManagementState>(initialStorage);

  const initialize = async () => {
    let currentState = getCurrentState();

    // Re-fetch orders
    const serverOrders = await client.query({
      query: GetOrdersByIdsDocument,
      variables: { ids: currentState.orders.map((o) => o.id) },
    });
    currentState.orders = currentState.orders.map((o) => {
      return serverOrders.data?.orders.find((v) => v.id === o.id) ?? o;
    });

    // Order by code
    if (orderCode) {
      if (!currentState.orders.some((o) => o.code === orderCode)) {
        const orderByCode = await client.query({
          query: GetOrderByCodeDocument,
          variables: { code: orderCode },
        });

        if (orderByCode.data?.getOrderByCode) {
          currentState.orders.push(orderByCode.data?.getOrderByCode);
        }
      }

      const order = currentState.orders.find((o) => o.code === orderCode);
      if (order) currentState.activeOrderId = order.id;
    }

    // New order
    if (mode === "new") {
      router.removeQuery("mode", true);
      let order = currentState.orders.find((o) => !o.isSaved && o.items.length === 0);

      if (!order) {
        order = generateInitialOrderSale();
        currentState.orders.push(order);
      }

      currentState.activeOrderId = order.id;
    }

    if (!currentState.activeOrderId) currentState.activeOrderId = currentState.orders[0]?.id;
    setIsInitialized(true);
    setState(currentState);
  };

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized]);

  const activeOrder = useMemo(() => {
    return state.orders.find((o) => o.id === state.activeOrderId) || null;
  }, [state.orders, state.activeOrderId]);

  const [calculate, { data: calculated, loading: isCalculating }] = useLazyQuery(
    CalculateOrderDocument,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const throttledCalculate = useThrottledCallback((value) => calculate(value), 300);

  useEffect(() => {
    if (activeOrder) {
      throttledCalculate({ variables: { input: normalizeOrderToInput(activeOrder) } });
    }
  }, [activeOrder]);

  const totalAmount =
    (calculated?.calculated?.totalAmount ?? 0) - (calculated?.calculated?.paidAmount ?? 0);

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
      name: activeOrder.code ? (
        <Fragment>
          <Trans>Order</Trans> #{activeOrder.code}
        </Fragment>
      ) : (
        <Trans>Order</Trans>
      ),
      process: async () => {
        if (!activeOrder.isSaved) return Promise.resolve();
        await client.mutate({
          mutation: ArchiveOrderDocument,
          variables: { orderId: activeOrder.id },
        });
        closeOrder(activeOrder.id);
      },
    });
  };

  const fetchOrder = async (orderId: string) => {
    const order = await client.query({ query: GetOrderByIdDocument, variables: { orderId } });
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, ...order.data?.order } : o)),
    }));
  };

  const saveOrder = async () => {
    if (!activeOrder) return;
    if (!activeOrder.isSaved) {
      const order = await client.mutate({
        mutation: CreateOrderDocument,
        variables: {
          input: normalizeOrderToInput(activeOrder),
        },
      });

      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === activeOrder.id
            ? { ...o, ...order.data?.order, isSaved: true, isDirty: false }
            : o,
        ),
      }));
    } else {
      const order = await client.mutate({
        mutation: UpdateOrderDocument,
        variables: {
          orderId: activeOrder.id,
          input: normalizeOrderToInput(activeOrder),
        },
      });
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === activeOrder.id
            ? { ...o, ...order.data?.order, isSaved: true, isDirty: false }
            : o,
        ),
      }));
    }
  };

  const availablePromotions = useQuery(GetAvailableCustomerPromotionsDocument, {
    variables: { customerId: activeOrder?.relatedCustomer?._id ?? "" },
    skip: !activeOrder?.relatedCustomer?._id,
  });

  const availableCombos = useQuery(GetCustomerProductCombosDocument, {
    variables: { customerId: activeOrder?.relatedCustomer?._id ?? "" },
    skip: !activeOrder?.relatedCustomer?._id,
  });

  useEventsListener(
    [EventType.OrderSynced, EventType.OrderUpdated],
    (e) => {
      const relatedOrder = state.orders.find((o) => o.id === e.ref);
      if (relatedOrder) fetchOrder(relatedOrder.id);
    },
    [state.orders],
  );

  return (
    <ModalPayReceipt>
      {(modalPayReceipt) => {
        const handlePayOrder = async () => {
          if (!activeOrder || totalAmount === 0) return;
          if (!activeOrder.isSaved || activeOrder.isDirty) await saveOrder();

          // const order = await getOrderById(activeOrder.id);

          const result = await client.mutate({
            mutation: PayOrderDocument,
            variables: {
              orderId: activeOrder.id,
              amount: activeOrder.totalAmount - activeOrder.paidAmount,
            },
          });

          if (!result.data?.payOrder) throw new Error(t`Failed to pay order`);

          modalPayReceipt.open({
            receipt: { id: result.data.payOrder },
            onPaid: () => {
              fetchOrder(activeOrder.id);
              closeOrder(activeOrder.id);
            },
          });
        };

        const context: OrdersManagementContext = {
          isInitialized,
          orders: state.orders,
          availableCombos: availableCombos.data?.combos ?? [],
          availablePromotionsLoading: availablePromotions.loading,
          availablePromotions: availablePromotions.data?.promotions ?? [],
          availableCombosLoading: availableCombos.loading,
          activeOrder,
          calculated: calculated?.calculated ?? null,
          isCalculating,
          activeOrderId: state.activeOrderId,
          setActiveOrderId: (orderId) => {
            setState((s) => ({ ...s, activeOrderId: orderId }));
          },
          addOrder: (order) => {
            const _order = order ?? generateInitialOrderSale();
            _order.createdAt = DateTime.toSeconds(new Date());
            setState((s) => ({ ...s, orders: [...s.orders, _order], activeOrderId: _order.id }));
          },
          addProduct: (product) => {
            let currentState = getCurrentState();
            const orderIndex = currentState.orders.findIndex((i) => i.id === state.activeOrderId);
            if (orderIndex === -1) return;

            const qtyPerUse = product.defaultQtyPerUse ?? 1;
            const isAlreadyAdded = currentState.orders[orderIndex].items.some(
              (i) => i.product._id === product._id,
            );

            if (isAlreadyAdded) {
              currentState.orders[orderIndex].items = currentState.orders[orderIndex].items.map(
                (i) =>
                  i.product._id === product._id ? { ...i, quantity: i.quantity + qtyPerUse } : i,
              );
            } else {
              const price = product.minPrice
                ? (product.minPrice + product.price) / 2
                : product.price;
              currentState.orders[orderIndex].items.push({
                __typename: "OrderItem",
                note: null,
                productId: product._id,
                revenue: 0,
                revenueRate: 0,
                product,
                quantity: qtyPerUse,
                price,
                assigneeUsers: [],
              });
            }
            currentState.orders[orderIndex].isDirty = true;
            setState(currentState);
          },
          removeProduct: (productId) => {
            let currentState = getCurrentState();
            const orderIndex = currentState.orders.findIndex((i) => i.id === state.activeOrderId);
            if (orderIndex === -1) return;

            currentState.orders[orderIndex].items = currentState.orders[orderIndex].items.filter(
              (i) => i.product._id !== productId,
            );
            currentState.orders[orderIndex].isDirty = true;
            setState(currentState);
          },
          updateProductItem: (productId, item) => {
            let currentState = getCurrentState();
            const orderIndex = currentState.orders.findIndex((i) => i.id === state.activeOrderId);
            if (orderIndex === -1) return;

            currentState.orders[orderIndex].items = currentState.orders[orderIndex].items.map(
              (i) => (i.product._id === productId ? { ...i, ...item } : i),
            );
            currentState.orders[orderIndex].isDirty = true;
            setState(currentState);
          },
          updateOrder: (value) => {
            let currentState = getCurrentState();
            const orderIndex = currentState.orders.findIndex((i) => i.id === state.activeOrderId);
            if (orderIndex === -1) return;

            currentState.orders[orderIndex] = { ...currentState.orders[orderIndex], ...value };
            currentState.orders[orderIndex].isDirty = true;
            setState(currentState);
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
