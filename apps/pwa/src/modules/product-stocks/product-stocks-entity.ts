import { BasePostgresEntity } from "@/types";
import { ProductEntity } from "../products/products-types";
import { WorkspaceMemberLegacy } from "../workspace-members/workspace-members-types";
import { ProductStockRecordType } from "./product-stocks-types";

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
  product: Pick<ProductEntity, "_id" | "name" | "image" | "displayName">;
  createdByUser: WorkspaceMemberLegacy;

  relatedOrderId?: string;
  relatedProductId?: string;
  relatedProduct?: Pick<ProductEntity, "_id" | "name" | "image" | "displayName">;
}
