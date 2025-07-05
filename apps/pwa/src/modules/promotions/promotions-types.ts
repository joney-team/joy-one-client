import { BasePostgresEntity, DynamicSelection } from "@/types";
import { CustomerEntity } from "../customers/customer-types";
import { ProductEntity } from "../products/products-types";
import { CustomFieldValue } from "../custom-fields/custom-field-types";

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED'
}

export enum PromotionType {
  DISCOUNT_RATE = 'DISCOUNT_RATE',
  DISCOUNT_AMOUNT = 'DISCOUNT_AMOUNT',
}

export interface PromotionDto {
  name: string;
  description?: string;
  image?: string;
  expireAt?: number;
  type: PromotionType;
  value: number;
  limitPerCustomer?: number;
  productsSelection?: DynamicSelection<Pick<ProductEntity, '_id' | 'name' | 'type'>>;
  customersSelection?: DynamicSelection<Pick<CustomerEntity, '_id' | 'name' | 'phone'>>;
  status?: PromotionStatus;
  customFieldValues?: CustomFieldValue[];
}

export interface PromotionEntity extends BasePostgresEntity {
  name: string;
  description?: string;
  image?: string;
  limitPerCustomer?: number;
  type: PromotionType;
  value: number;
  productsSelection?: DynamicSelection<Pick<ProductEntity, '_id' | 'name' | 'type'>>;
  customersSelection?: DynamicSelection<Pick<CustomerEntity, '_id' | 'name' | 'phone'>>;
  expireAt?: number;
  status: PromotionStatus;
}