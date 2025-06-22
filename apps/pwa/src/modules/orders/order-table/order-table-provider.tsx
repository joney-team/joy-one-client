"use client";

import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { t, tMulti } from "@/modules/lang/lang-service";
import { OrderDto } from "@/modules/orders/orders-dtos";
import { OrderEntity } from "@/modules/orders/order-entity";
import {
  archiveOrder,
  calculateOrder,
  createOrder,
  getOrderByCode,
  payOrder,
  updateOrder,
} from "@/modules/orders/orders-service";
import { OrderCalculated, OrderDiscountType, OrderType } from "@/modules/orders/orders-types";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { getProductCombosByCustomer } from "@/modules/product-combos/product-combos-service";
import { ProductVoucherEntity } from "@/modules/product-vouchers/product-vouchers-types";
import { OnModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCoin, IconPencilDiscount } from "@tabler/icons-react";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { Context } from "./order-table-context";
import { OrderTableContext, OrderTableFormValues } from "./order-table-types";

const defaultOrderValues: OrderTableFormValues = {
  assigneeUsers: [],
  note: "",
  type: OrderType.COMMON,
  directDiscount: 0,
  combos: [],
  coupons: [],
  vouchers: [],
  items: [],
};

export const OrderTableProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const isEnabled =
    workspace.hasPermission(WorkspacePermission.ORDERS_CREATE) &&
    workspace.isModuleActive("orders");

  const [version, setVersion] = useState(0);

  const order = useRef<OrderEntity | null>(null);

  const [calculated, setCalculated] = useState<OrderCalculated | null>(null);
  const [tipAmount, setTipAmount] = useState(0);

  const [isCalculating, setIsCalculating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [combos, setCombos] = useState<ProductComboEntity[]>([]);
  const [vouchers, setVouchers] = useState<ProductVoucherEntity[]>([]);

  const isDirty = useRef(false);

  const forceUpdate = (isHasChange = false) => {
    if (isHasChange) isDirty.current = true;
    setVersion((v) => v + 1);
  };

  const values = useRef<OrderTableFormValues>({ ...defaultOrderValues });

  const onCalculate = useDebouncedCallback(async (values: OrderTableFormValues) => {
    try {
      const result = await calculateOrder({
        ...getOrderDto(values),
        id: order.current?.id,
      });
      setCalculated(result);
    } catch (error) {
    } finally {
      setIsCalculating(false);
    }
  }, 100);

  useEffect(() => {
    if (isEnabled) {
      setIsCalculating(true);
      onCalculate({ ...values.current });
    }
  }, [values.current, isEnabled, version]);

  useEffect(() => {
    setCombos([]);
    if (values.current.relatedCustomer) {
      getProductCombosByCustomer(values.current.relatedCustomer._id)
        .then(setCombos)
        .catch(console.error);
    }
  }, [values.current.relatedCustomer]);

  const subTotalAmount =
    calculated?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const totalDiscountAmount =
    calculated?.discounts.reduce((acc, discount) => acc + discount.amount, 0) || 0;
  const totalAmount = (calculated?.totalAmount || 0) - (order.current?.paidAmount || 0);

  const reset = () => {
    values.current = { ...defaultOrderValues };
    order.current = null;
    setTipAmount(0);
    setCalculated(null);
    forceUpdate();
  };

  const submit = async () => {
    if (values.current.items.length === 0) return;

    const dto = getOrderDto(values.current);
    try {
      setIsSubmitting(true);
      if (order.current) {
        const _order = await updateOrder(order.current.id, dto);
        values.current = {
          ...defaultOrderValues,
          ..._order,
        };
        order.current = _order;
      } else {
        const _order = await createOrder(dto);
        values.current = {
          ...defaultOrderValues,
          ..._order,
        };
        order.current = _order;
      }
      isDirty.current = false;
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const pay = async () => {
    try {
      setIsPaying(true);
      if (!order.current || !calculated) return;

      const amount = calculated.totalAmount - (order.current.paidAmount || 0);
      if (isDirty.current) await submit();

      const receipt = await payOrder(order.current.id, {
        amount,
        tipAmount: tipAmount,
      });

      OnModalPayReceipt({
        receipt,
        onPaid: () => reset(),
      });
    } catch (error) {
      onError(error);
    } finally {
      setIsPaying(false);
    }
  };

  const setOrder = (or: OrderEntity) => {
    order.current = or;
    values.current = {
      ...defaultOrderValues,
      ...or,
      directDiscount: or.discounts.find((d) => d.type === OrderDiscountType.DIRECT)?.amount || 0,
    };
    isDirty.current = false;
    forceUpdate();
  };

  useEventsListener(
    [EventType.ORDER_UPDATED, EventType.ORDER_SYNCED],
    (e) => {
      if (order.current && e.ref === order.current.id) {
        getOrderByCode(order.current?.code || "")
          .then(setOrder)
          .catch(console.error);
      }
    },
    [order.current?.id]
  );

  const setValues = (newValues: OrderTableFormValues) => {
    values.current = newValues;
    forceUpdate(true);
  };

  const ctx: OrderTableContext = {
    calculated,
    isCalculating,
    isSubmitting,
    isPaying,
    isDirty: isDirty.current,
    order: order.current,
    values: values.current,
    setValues,
    tipAmount,
    setTipAmount,
    combos: combos.filter((c) => !order.current || c.sourceId !== order.current.id),
    vouchers,
    subTotalAmount,
    totalDiscountAmount,
    totalAmount,
    addProduct: (product) => {
      const seletedIndex = values.current.items.findIndex(
        (item) => item.product._id === product._id
      );
      const qtyPerUse = product.defaultQtyPerUse || 1;

      if (seletedIndex !== -1) {
        // Increase quantity
        const items = [...values.current.items].map((item, index) =>
          index === seletedIndex
            ? {
                ...item,
                quantity: item.quantity + qtyPerUse,
              }
            : item
        );

        values.current.items = items;
      } else {
        // Add new item
        const price = product.minPrice ? (product.minPrice + product.price) / 2 : product.price;
        const items = [
          ...values.current.items,
          {
            product,
            quantity: qtyPerUse,
            price,
            assigneeUsers: [],
          },
        ];

        values.current.items = items;
      }
      forceUpdate(true);
    },
    archive: async () => {
      if (!order.current) return;
      onArchive({
        name: tMulti(["order"], [`#${order.current.code}`]),
        process: () => archiveOrder(order.current!.id),
        onArchived: reset,
      });
    },
    pay,
    submit,
    removeProduct: (product) => {
      const seletedIndex = values.current.items.findIndex(
        (item) => item.product._id === product._id
      );
      if (seletedIndex !== -1) {
        const items = [...values.current.items].filter((_, index) => index !== seletedIndex);
        values.current.items = items;
      }
      forceUpdate(true);
    },
    updateItem: (index, item) => {
      const items = [...values.current.items].map((i, idx) => (idx === index ? item : i));
      values.current.items = items;
      forceUpdate(true);
    },
    reset,
    onDirectDiscount: () => {
      const onClear = () => {
        const value = 0;
        values.current.directDiscount = value;
        forceUpdate(true);
      };

      const onDone = (value: number) => {
        values.current.directDiscount = value;
        forceUpdate(true);
      };

      OnModalInput({
        title: t("direct_discount"),
        icon: IconPencilDiscount,
        value:
          values.current.directDiscount && values.current.directDiscount >= 0
            ? values.current.directDiscount
            : undefined,
        onDone,
        type: InputModalType.MONEY,
        onClear,
      });
    },
    onTip: () => {
      OnModalInput({
        title: "TIP",
        icon: IconCoin,
        value: tipAmount > 0 ? tipAmount : undefined,
        onDone: (value) => {
          setTipAmount(value);
        },
        type: InputModalType.MONEY,
        onClear: () => {
          setTipAmount(0);
        },
      });
    },
    setOrder,
    setCustomer: (customer) => {
      values.current.relatedCustomer = customer;
      forceUpdate(true);
    },
  };

  return <Context.Provider value={ctx}>{props.children}</Context.Provider>;
};

export const getOrderDto = (values: OrderTableFormValues): OrderDto => {
  return {
    type: values.type,
    items: values.items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.price,
      note: item.note,
      assigneeUserIds: item.assigneeUsers.map((u) => u.userId),
    })),
    couponIds: values.coupons?.map((c) => c._id),
    voucherIds: values.vouchers?.map((v) => v._id),
    comboIds: values.combos?.map((c) => c.id),
    directDiscount: values.directDiscount,
    assigneeUserIds: values.assigneeUsers.map((u) => u.userId),
    relatedCustomerId: values.relatedCustomer?._id,
  };
};
