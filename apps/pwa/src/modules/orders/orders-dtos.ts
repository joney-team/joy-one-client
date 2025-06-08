import { OrderType } from "./orders-types";

export interface OrderFormItem {
  productId: string;
  quantity: number;
  price: number;
  note?: string;
  assigneeUserIds?: string[];
}

export interface OrderDto {
  type: OrderType;
  items: OrderFormItem[];
  couponIds?: string[];
  voucherIds?: string[];
  comboIds?: string[];
  directDiscount?: number;
  assigneeUserIds?: string[];
  discountAmount?: number;
  note?: string;
  relatedCustomerId?: string;
}

export interface OrderCalculateDto extends OrderDto {
  id?: string;
}