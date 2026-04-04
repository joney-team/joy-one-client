"use client";

import { OrderType } from "@/graphql/enums.graphql";
import { OrderInput } from "@/graphql/types.graphql";
import { OrderFragment } from "../graphql/fragmentOrder.graphql";

export const normalizeOrderToInput = (order: OrderFragment): OrderInput => {
  return {
    id: order.id,
    items: order.items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.price,
      note: item.note ?? null,
      assigneeUserIds: item.assigneeUsers.map((u) => u.userId),
    })),
    type: order.type ?? OrderType.Common,
    note: order.note ?? null,
    relatedCustomerId: order.relatedCustomer?._id ?? null,
    comboIds: order.comboIds ?? [],
    promotionIds: order.promotionIds ?? [],
    assigneeUserIds: order.assigneeUserIds ?? [],
    workspaceBranchId: order.workspaceBranchId ?? null,
    directDiscount: order.directDiscount ?? null,
    relatedUserIds: order.relatedUserIds ?? [],
  };
};
