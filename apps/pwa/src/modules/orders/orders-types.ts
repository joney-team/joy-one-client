import { ProductEntity } from "../products/products-types";
import { WorkspaceMemberInfo } from "../workspace-members/workspace-members-types";
import { OrderEntity } from "./order-entity";

export enum OrderType {
  COMMON = "COMMON",
}

export enum OrderPaymentStatus {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
}

export interface OrderDtoItem {
  productId: string;
  quantity: number;
  note?: string;
  assigneeUserIds?: string[];
}

export interface OrderItem extends OrderDtoItem {
  price: number;
  revenue: number;
  product: ProductEntity;
  assigneeUsers: WorkspaceMemberInfo[];
}

export enum OrderDiscountType {
  DIRECT = "DIRECT",
  USE_EXISTED_COMBO = "USE_EXISTED_COMBO",
  USE_DIRECT_COMBO = "USE_DIRECT_COMBO",
  COUPON = "COUPON",
  VOUCHER = "VOUCHER",
}

export interface OrderDiscount {
  amount: number;
  type: OrderDiscountType;

  productId?: string;
  productQuantity?: number;

  productCouponId?: string;

  productComboId?: string;

  productVoucherId?: string;
  productVoucherAmount?: number;
}

export interface OrderEntityCalculated extends OrderEntity {}

export interface PayOrderDto {
  amount: number;
  tipAmount?: number;
}
