import { CouponEntity } from "@/modules/coupons/coupon-types";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { ProductVoucherEntity } from "@/modules/product-vouchers/product-vouchers-types";
import { BasePostgresEntity } from "@/types";
import { CustomerDataFragment } from "../customers/graphql/fragmentCustomer.graphql";
import { PromotionEntity } from "../promotions/promotions-types";
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
  promotions: PromotionEntity[];
  discounts: OrderDiscount[];
  discountAmount: number;
  paidAmount: number;
  totalAmount: number;
  note?: string;
  // Related entities
  relatedCustomerId?: string;
  relatedCustomer?: CustomerDataFragment;
  relatedUserIds: string[];
}
