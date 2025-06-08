import { ResponseList } from "@/types";
import { ReceiptEntity } from "../receipts/receipts-types";
import { MainRequest } from "../requests/main.request";
import { OrderCalculateDto, OrderDto } from "./orders-dtos";
import { OrderEntity } from "./order-entity";
import { OrderCalculated, OrderPaymentStatus, PayOrderDto } from "./orders-types";
import { OnModalPayReceipt } from "@/modules/receipts/modals/modal-pay-receipt";
import { onActionLoad } from "@/utils/actions";

export async function getOrderByCode(code: string) {
  return MainRequest.get<OrderEntity>(`/orders/codes/${code}`);
}

export async function getOrderById(id: string) {
  return MainRequest.get<OrderEntity>(`/orders/ids/${id}`);
}

export async function getOrderList(query?: any) {
  return MainRequest.get<ResponseList<OrderEntity>>('/orders', query);
}

export async function createOrder(dto: OrderDto) {
  return MainRequest.post<OrderEntity>('/orders', dto);
}

export async function updateOrder(id: string, dto: OrderDto) {
  return MainRequest.put<OrderEntity>(`/orders/${id}`, dto);
}

export async function calculateOrder(dto: OrderCalculateDto) {
  return MainRequest.post<OrderCalculated>('/orders/calculate', dto);
}

export async function payOrder(id: string, dto: PayOrderDto) {
  return MainRequest.post<ReceiptEntity>(`/orders/${id}/pay`, dto);
}

export async function archiveOrder(id: string) {
  return MainRequest.delete(`/orders/${id}`);
}

export async function getOrders(query?: any) {
  return MainRequest.get<ResponseList<OrderEntity>>('/orders', query);
}

export async function syncOrder(id: string) {
  return MainRequest.post(`/orders/${id}/sync`);
}

export const orderPaymentStatusOptions: {
  [key in OrderPaymentStatus]: {
    color: string,
  }
} = {
  [OrderPaymentStatus.PROCESSING]: {
    color: 'primary',
  },
  [OrderPaymentStatus.COMPLETED]: {
    color: 'green',
  }
}

export const onPayOrder = async (order: OrderEntity) => {
  if (order.paymentStatus === OrderPaymentStatus.COMPLETED) return;

  onActionLoad({
    isShowCompleted: false,
    process: async () => {
      const receipt = await payOrder(order.id, {
        amount: order.totalAmount - order.paidAmount,
      })

      OnModalPayReceipt({ receipt })
    }
  })
}