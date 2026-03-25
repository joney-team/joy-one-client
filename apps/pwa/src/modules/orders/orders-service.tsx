"use client";

import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { ReceiptFragment } from "../receipts/graphql/fragmentReceipt.graphql";
import { OrderEntity } from "./order-entity";
import { OrderCalculateDto, OrderDto } from "./orders-dtos";
import { OrderEntityCalculated, OrderPaymentStatus, PayOrderDto } from "./orders-types";

export async function getOrderByCode(code: string) {
  return restClient.get<OrderEntity>(`/orders/codes/${code}`);
}

export async function getOrderById(id: string) {
  return restClient.get<OrderEntity>(`/orders/ids/${id}`);
}

export async function getOrdersByIds(ids: string[]) {
  return restClient.get<OrderEntity[]>(`/orders/ids`, { params: { ids } });
}

export async function getOrderList(query?: any) {
  return restClient.get<ResponseList<OrderEntity>>("/orders", { params: query });
}

export async function createOrder(dto: OrderDto) {
  return restClient.post<OrderEntity>("/orders", dto);
}

export async function updateOrder(id: string, dto: OrderDto) {
  return restClient.put<OrderEntity>(`/orders/${id}`, dto);
}

export async function calculateOrder(dto: OrderCalculateDto) {
  return restClient.post<OrderEntityCalculated>("/orders/calculate", dto);
}

export async function payOrder(id: string, dto: PayOrderDto) {
  return restClient.post<ReceiptFragment>(`/orders/${id}/pay`, dto);
}

export async function archiveOrder(id: string) {
  return restClient.delete(`/orders/${id}`);
}

export async function getOrders(query?: any) {
  return restClient.get<ResponseList<OrderEntity>>("/orders", { params: query });
}

export async function syncOrder(id: string) {
  return restClient.post(`/orders/${id}/sync`);
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
