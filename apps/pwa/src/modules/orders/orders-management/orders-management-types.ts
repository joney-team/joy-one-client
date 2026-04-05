import { ProductComboFragment } from "@/modules/product-combos/graphql/fragmentProductCombo.graphql";
import { PromotionFragment } from "@/modules/promotions/graphql/fragmentPromotion.graphql";
import { OrderFragment } from "../graphql/fragmentOrder.graphql";

export interface OrderState extends OrderFragment {
  isSaved?: boolean;
  isDirty?: boolean;
}

export interface OrdersManagementState {
  orders: OrderState[];
  activeOrderId?: string | null;
}

export type OrderItem = OrderFragment["items"][number];

export interface OrdersManagementContext extends OrdersManagementState {
  isInitialized: boolean;
  activeOrder: OrderState | null;
  availableCombos: ProductComboFragment[];
  availableCombosLoading: boolean;
  availablePromotions: PromotionFragment[];
  availablePromotionsLoading: boolean;
  setActiveOrderId: (orderId: string) => void;
  addOrder: (order?: OrderFragment) => void;
  addProduct: (product: OrderItem["product"]) => void;
  removeProduct: (productId: string) => void;
  updateProductItem: (
    productId: string,
    item: Pick<OrderItem, "quantity" | "price" | "note" | "assigneeUsers">,
  ) => void;
  closeOrder: (id?: string | null) => void;
  removeOrder: () => void;
  calculated: OrderFragment | null;
  isCalculating: boolean;
  updateOrder: (values: Partial<OrderState>) => void;
  payOrder: () => Promise<void>;
  saveOrder: () => Promise<void>;
}
