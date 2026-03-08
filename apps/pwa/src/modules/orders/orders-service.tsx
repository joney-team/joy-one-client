"use client";

import { ResponseList } from "@/types";
import { api } from "../apis";
import { ReceiptDataFragment } from "../receipts/graphql/fragmentReceipt.graphql";
import { OrderEntity } from "./order-entity";
import { OrderCalculateDto, OrderDto } from "./orders-dtos";
import { OrderEntityCalculated, OrderPaymentStatus, PayOrderDto } from "./orders-types";

export async function getOrderByCode(code: string) {
  return api.get<OrderEntity>(`/orders/codes/${code}`);
}

export async function getOrderById(id: string) {
  return api.get<OrderEntity>(`/orders/ids/${id}`);
}

export async function getOrdersByIds(ids: string[]) {
  return api.get<OrderEntity[]>(`/orders/ids`, { params: { ids } });
}

export async function getOrderList(query?: any) {
  return api.get<ResponseList<OrderEntity>>("/orders", { params: query });
}

export async function createOrder(dto: OrderDto) {
  return api.post<OrderEntity>("/orders", dto);
}

export async function updateOrder(id: string, dto: OrderDto) {
  return api.put<OrderEntity>(`/orders/${id}`, dto);
}

export async function calculateOrder(dto: OrderCalculateDto) {
  return api.post<OrderEntityCalculated>("/orders/calculate", dto);
}

export async function payOrder(id: string, dto: PayOrderDto) {
  return api.post<ReceiptDataFragment>(`/orders/${id}/pay`, dto);
}

export async function archiveOrder(id: string) {
  return api.delete(`/orders/${id}`);
}

export async function getOrders(query?: any) {
  return api.get<ResponseList<OrderEntity>>("/orders", { params: query });
}

export async function syncOrder(id: string) {
  return api.post(`/orders/${id}/sync`);
}

export const orderPaymentStatusOptions: {
  [key in OrderPaymentStatus]: {
    color: string;
  };
} = {
  [OrderPaymentStatus.PROCESSING]: {
    color: "primary",
  },
  [OrderPaymentStatus.COMPLETED]: {
    color: "green",
  },
};
