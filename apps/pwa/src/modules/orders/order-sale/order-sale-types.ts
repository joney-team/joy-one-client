import { UseQuery } from "@/modules/apis/use-query";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { ProductEntity } from "@/modules/products/products-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { OrderCalculated, OrderPaymentStatus } from "../orders-types";
import { OrderEntity } from "../order-entity";

export type OrderSaleProduct = Pick<
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
>;

export interface OrderSaleItem {
  product: OrderSaleProduct;
  quantity: number;
  price: number;
  assigneeUsers: WorkspaceMemberInfo[];
  note?: string;
}

export interface TOrderSale {
  id: string;
  isSaved: boolean;
  isDirty?: boolean;
  code?: string;
  items: OrderSaleItem[];
  relatedCustomer?: CustomerShortInfo | null;
  directDiscount?: number;
  note?: string;
  assigneeUsers: WorkspaceMemberInfo[];
  createdAt: number;
  paymentStatus?: OrderPaymentStatus;
  paidAmount?: number;
  tipAmount?: number;
}

export interface OrderSaleContextState {
  orders: TOrderSale[];
  activeOrderId: string;
}

export interface OrderSaleContext extends OrderSaleContextState {
  isInitialized: boolean;
  activeOrder: TOrderSale | null;
  setActiveOrderId: (orderId: string) => void;
  addOrder: (order?: OrderEntity) => void;
  addProduct: (product: OrderSaleProduct) => void;
  removeProduct: (productId: string) => void;
  updateProductItem: (productId: string, item: Partial<Omit<OrderSaleItem, "product">>) => void;
  closeOrder: () => void;
  removeOrder: () => void;
  calculating: UseQuery<OrderCalculated>;
  updateOrder: (values: Partial<TOrderSale>) => void;
  payOrder: () => Promise<void>;
  saveOrder: () => Promise<void>;
}
