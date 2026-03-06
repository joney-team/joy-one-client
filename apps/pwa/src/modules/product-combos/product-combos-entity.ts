import { BasePostgresEntity } from "@/types";
import { ProductEntity } from "../products/products-types";
import {
  ProductComboHistoryRecord,
  ProductComboRef,
  ProductComboSourceType,
  ProductComboStatus,
} from "./product-combos-types";

export interface ProductComboHistoryEntity extends BasePostgresEntity {
  productComboId: string;
  ref: string;
  records: ProductComboHistoryRecord[];
  note?: string;
  orderId?: string;
}

export interface ProductComboEntity extends BasePostgresEntity {
  productId: string;
  product: ProductEntity;
  customerId: string;
  customer: any;
  workspaceId: string;
  productRefs: ProductComboRef[];
  sourceType: ProductComboSourceType;
  sourceId: string;
  status: ProductComboStatus;
  history: ProductComboHistoryEntity[];
  expireAt?: number;
}
