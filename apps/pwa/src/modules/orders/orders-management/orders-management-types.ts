import { UseQuery } from "@/modules/apis/use-query";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { ProductEntity } from "@/modules/products/products-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { OrderCalculated, OrderPaymentStatus } from "../orders-types";
import { OrderEntity } from "../order-entity";

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
}

export interface OrdersManagementState {
  orders: Order[];
  activeOrderId: string;
}

export interface OrdersManagementContext extends OrdersManagementState {
  isInitialized: boolean;
  activeOrder: Order | null;
  setActiveOrderId: (orderId: string) => void;
  addOrder: (order?: OrderEntity) => void;
  addProduct: (product: OrderProduct) => void;
  removeProduct: (productId: string) => void;
  updateProductItem: (productId: string, item: Partial<Omit<OrderItem, "product">>) => void;
  closeOrder: () => void;
  removeOrder: () => void;
  calculating: UseQuery<OrderCalculated>;
  updateOrder: (values: Partial<Order>) => void;
  payOrder: () => Promise<void>;
  saveOrder: () => Promise<void>;
}
