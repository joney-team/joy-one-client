import { type ProductStock } from "@/modules/product-stocks/product-stocks-types";
import { BaseMongoEntity, Query } from "@/types";

export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  COMBO = 'COMBO',
  VOUCHER = 'VOUCHER',
}

export interface ProductDto {
  name: string;
  content?: string;
  displayName?: string;
  tags: string[];
  unit: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  image?: string;
  type: ProductType;
  defaultQtyPerUse?: number;

  isStockCheck?: boolean;
  isHiddenInReceiptWhenNoPrice?: boolean;
  warningOutOfDateBeforeDays?: number;
  warningOutOfStockQty?: number;

  categoryId?: string;
  postId?: string;
  supplies?: ProductSupply[];

  // Combo related
  combos?: ProductSupply[];
  combosExpireInDays?: number;

  // Voucher related
  voucherExpireInDays?: number;
  voucherLimitProductIds?: string[];
}

export interface ProductEntityBindData {
  category: ProductEntity;
  combos: { productId: string; product: ProductEntity; quantity: number }[];
  voucherExcludeProducts: ProductEntity[];
  voucherIncludeProducts: ProductEntity[];
  stock: ProductStock;
}

export interface ProductEntity extends BaseMongoEntity, ProductEntityBindData {
  name: string;
  image?: string;
  content?: string;
  displayName?: string;
  tags: string[];
  unit: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  workspaceId: string;
  isArchived: boolean;
  defaultQtyPerUse?: number;

  isStockCheck?: boolean;
  isHiddenInReceiptWhenNoPrice?: boolean;
  warningOutOfDateBeforeDays?: number;
  warningOutOfStockQty?: number;
  supplies: ProductSupply[];

  // Combo related
  combosExpireInDays?: number;
  
  // Voucher related
  voucherAmount?: number;
  voucherExpireInDays?: number;
  voucherExcludeProductIds?: string[];
  voucherIncludeProductIds?: string[];

  type: ProductType;
  categoryId?: string;
  postId?: string;
}

export interface ProductsQuery extends Query {
  q?: string;
  type?: ProductType | ProductType[];
}

export interface ProductSupply {
  productId: string;
  product: ProductEntity;
  quantity: number;
}

export interface ProductCombo {
  productId: string;
  product: ProductEntity;
  quantity: number;
}