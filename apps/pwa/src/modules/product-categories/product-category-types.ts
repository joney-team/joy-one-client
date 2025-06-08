import { BaseMongoEntity } from "@/types";
import { ProductType } from "../products/products-types";

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