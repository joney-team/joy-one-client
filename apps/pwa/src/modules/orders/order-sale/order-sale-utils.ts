import { OrderEntity } from "../order-entity";
import { OrderCalculateDto } from "../orders-dtos";
import { OrderType } from "../orders-types";
import { TOrderSale } from "./order-sale-types";

export const normalizeOrderSale = (order: OrderEntity): TOrderSale => {
  return {
    id: order.id,
    isSaved: true,
    isDirty: false,
    code: order.code,
    items: order.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      assigneeUsers: item.assigneeUsers,
      note: item.note,
    })),
    assigneeUsers: order.assigneeUsers ?? [],
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    paidAmount: order.paidAmount,
    tipAmount: 0,
  };
};

export const normalizeOrderSaleForCalculate = (orderSale: TOrderSale): OrderCalculateDto => {
  return {
    id: orderSale.id,
    type: OrderType.COMMON,
    items: orderSale.items.map((item) => ({
      price: item.price,
      productId: item.product._id,
      quantity: item.quantity,
      assigneeUserIds: item.assigneeUsers.map((u) => u.userId),
      note: item.note,
    })),
    assigneeUserIds: orderSale.assigneeUsers.map((u) => u.userId),
    note: orderSale.note,
    directDiscount: orderSale.directDiscount,
  };
};
