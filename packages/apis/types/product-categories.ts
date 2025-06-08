import { BaseMongoEntity } from "./database";
import { ProductType } from "./products";

export interface ProductCategoryDto {
  name: string;
  productType: ProductType;
  order?: number;
}

export interface ProductCategoryEntity extends BaseMongoEntity {
  name: string;
  workspaceId: string;
  productType: ProductType;
  order: number;
}