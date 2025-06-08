import { ProductStockEntity } from "./product-stocks-entity";

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