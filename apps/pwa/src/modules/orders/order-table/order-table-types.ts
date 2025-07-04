import { CouponEntity } from "@/modules/coupons/coupon-types";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { OrderEntity } from "@/modules/orders/order-entity";
import { OrderCalculated, OrderType } from "@/modules/orders/orders-types";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { ProductVoucherEntity } from "@/modules/product-vouchers/product-vouchers-types";
import { ProductEntity } from "@/modules/products/products-types";
import { PromotionEntity } from "@/modules/promotions/promotions-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";

export interface OrderTableFormValueItem {
  product: ProductEntity;
  quantity: number;
  price: number;
  note?: string;
  assigneeUsers: WorkspaceMemberInfo[];
}

export interface OrderTableFormValues {
  items: OrderTableFormValueItem[];
  type: OrderType;
  coupons: CouponEntity[];
  vouchers: ProductVoucherEntity[];
  combos: ProductComboEntity[];
  assigneeUsers: WorkspaceMemberInfo[];
  directDiscount?: number;
  note?: string;
  relatedCustomer?: CustomerShortInfo;
  promotions: PromotionEntity[];
}

export interface OrderTableContext {
  calculated: OrderCalculated | null;
  isCalculating: boolean;
  isSubmitting: boolean;
  isPaying: boolean;
  order: OrderEntity | null;
  values: OrderTableFormValues;
  setValues: (values: OrderTableFormValues) => void;
  isDirty: boolean;
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  combos: ProductComboEntity[];
  vouchers: ProductVoucherEntity[];
  subTotalAmount: number;
  totalDiscountAmount: number;
  totalAmount: number;

  // APIs
  addProduct: (product: ProductEntity) => void;
  removeProduct: (product: ProductEntity) => void;
  updateItem: (index: number, item: OrderTableFormValueItem) => void;
  reset: () => void;
  submit: () => Promise<void>;
  pay: () => Promise<void>;
  archive: () => Promise<void>;
  onDirectDiscount: () => void;
  onTip: () => void;
  setOrder: (order: OrderEntity) => void;
  setCustomer: (customer: CustomerShortInfo | undefined) => void;
}