import { UseRestQuery } from "@/modules/apis/use-rest-query";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { ProductEntity } from "@/modules/products/products-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { OrderDiscount, OrderEntityCalculated, OrderPaymentStatus } from "../orders-types";
import { OrderEntity } from "../order-entity";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { PromotionEntity } from "@/modules/promotions/promotions-types";
import { ResponseList } from "@/types";

export type OrderProduct = Pick<
  ProductEntity,
  | "_id"
  | "name"
  | "image"
  | "price"
  | "minPrice"
  | "maxPrice"
  | "unit"
  | "displayName"
  | "defaultQtyPerUse"
  | "type"
  | "isHiddenInReceiptWhenNoPrice"
>;

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
  price: number;
  assigneeUsers: WorkspaceMemberInfo[];
  note?: string;
}

export interface Order {
  id: string;
  isSaved: boolean;
  isDirty?: boolean;
  code?: string;
  items: OrderItem[];
  relatedCustomer?: CustomerShortInfo | null;
  directDiscount?: number;
  note?: string;
  assigneeUsers: WorkspaceMemberInfo[];
  createdAt: number;
  paymentStatus?: OrderPaymentStatus;
  paidAmount?: number;
  tipAmount?: number;
  combos?: ProductComboEntity[];
  prevCombos?: ProductComboEntity[];
  promotions?: PromotionEntity[];
  prevPromotions?: PromotionEntity[];
}

export interface OrderCalculated extends Order {
  totalAmount: number;
  discounts: OrderDiscount[];
}

export interface OrdersManagementState {
  orders: Order[];
  activeOrderId: string;
}

export interface OrdersManagementContext extends OrdersManagementState {
  isInitialized: boolean;
  activeOrder: Order | null;
  availableCombos: UseRestQuery<ProductComboEntity[]>;
  availablePromotions: UseRestQuery<ResponseList<PromotionEntity>>;
  setActiveOrderId: (orderId: string) => void;
  addOrder: (order?: OrderEntity) => void;
  addProduct: (product: OrderProduct) => void;
  removeProduct: (productId: string) => void;
  updateProductItem: (productId: string, item: Partial<Omit<OrderItem, "product">>) => void;
  closeOrder: (id?: string | null) => void;
  removeOrder: () => void;
  calculating: UseRestQuery<OrderEntityCalculated>;
  updateOrder: (values: Partial<Order>) => void;
  payOrder: () => Promise<void>;
  saveOrder: () => Promise<void>;
}
