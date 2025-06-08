import { BasePostgresEntity } from "./database";
import { ProductEntity } from "./products";
import { WorkspaceMemberInfo } from "./workspace-members";

export interface ProductStockEntity extends BasePostgresEntity {
  productId: string;
  product: ProductEntity;
  quantity: number;
  remainQuantity: number;
  expireAt: number;
  costPrice: number;
  note?: string;
  code?: string;
  records: ProductStockRecordEntity[];
}

export interface ProductStockRecordEntity extends BasePostgresEntity {
  ref?: string;
  note?: string;
  type: ProductStockRecordType;
  quantity: number;
  productId: string;
  productStockId: string;
  productStock: ProductStockEntity;
  stockCode?: string;
  product: Pick<ProductEntity, '_id' | 'name' | 'image' | 'displayName'>;
  createdByUser: WorkspaceMemberInfo;
  
  relatedOrderId?: string;
  relatedProductId?: string;
  relatedProduct?: Pick<ProductEntity, '_id' | 'name' | 'image' | 'displayName'>;
}

export enum ProductStockRecordType {
  STOCK_IN = 'IN',
  STOCK_OUT = 'OUT',
}

export interface ProductStockRecordDto {
  ref?: string;
  productId: string;
  quantity: number;
  note?: string;
  relatedOrderId?: string;
}

export interface ProductStockInDto extends ProductStockRecordDto {
  code?: string;
  costPrice?: number;
  expireAt?: number;
}

export interface ProductStockOutDto extends ProductStockRecordDto { 
  stockId?: string;
}

export interface ProductStock {
  quantity: number;
  stocks: ProductStockEntity[];
}

export interface MultipleProductsStockInDto {
  stocks: ProductStockInDto[];
}