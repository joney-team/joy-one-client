import { BasePostgresEntity } from "@/types";
import { CouponEntity } from "@/modules/coupons/coupon-types";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { ProductVoucherEntity } from "@/modules/product-vouchers/product-vouchers-types";
import { OrderDiscount, OrderItem, OrderPaymentStatus, OrderType } from "./orders-types";

export interface OrderEntity extends BasePostgresEntity {
  code: string;
  type: OrderType;
  items: OrderItem[];
  workspaceId: string;
  workspaceBranchId?: string;
  paymentStatus: OrderPaymentStatus;
  couponIds: string[];
  voucherIds: string[];
  comboIds: string[];
  combos: ProductComboEntity[];
  coupons: CouponEntity[];
  vouchers: ProductVoucherEntity[];
  discounts: OrderDiscount[];
  discountAmount: number;
  paidAmount: number;
  totalAmount: number;
  note?: string;
  // Related entities
  relatedCustomerId?: string;
  relatedCustomer?: CustomerShortInfo;
  relatedUserIds: string[];
}