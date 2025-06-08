import { ProductEntity } from "../products/products-types";

export enum ProductComboSourceType {
  ORDER = 'ORDER',
}

export interface ProductComboDto {
  productId: string;
  customerId: string;
  workspaceId: string;
  refs: ProductComboRef[];
  sourceType: ProductComboSourceType;
  sourceId: string;
  expireAt?: number;
}

export enum ProductComboStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  SOURCE_UNAVAILABLE = 'SOURCE_UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface UseProductComboDto {
  ref: string;
  records: ProductComboHistoryRecord[];
  orderId?: string;
  note?: string;
}

export interface ProductComboRef {
  productRefId: string;
  productRef: ProductEntity;
  productRefRevenue: number;
  quantity: number;
  quantityUsed: number;
}

export interface ProductComboHistoryRecord {
  productRefId: string;
  quantity: number;
}