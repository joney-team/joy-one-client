import { BaseMongoEntity } from "@/types";
import { ProductEntity } from "../products/products-types";
import { CustomerEntity } from "../customers/customer-types";

export enum CouponRuleBenefitType {
  DISCOUNT_ON_TOTAL = 'DISCOUNT_ON_TOTAL',
  DISCOUNT_ON_PRODUCT = 'DISCOUNT_ON_PRODUCT',
  FREE_ON_PRODUCT = 'FREE_ON_PRODUCT',
}

export interface CouponRuleBenefit {
  type: CouponRuleBenefitType;
  data?: any
}

export enum CouponRuleConditionType {
  MINIMUM_TOTAL = 'MINIMUM_TOTAL',
  LIMIT_PRODUCTS = 'LIMIT_PRODUCTS',
}

export interface CouponRuleTerm {
  type: CouponRuleConditionType;
  data?: any;
}

export interface CouponRuleDto {
  name: string;
  description?: string;
  image?: string;
  benefits: CouponRuleBenefit[];
  terms: CouponRuleTerm[];
  isCumulative?: boolean;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface CouponRuleEntity extends BaseMongoEntity {
  name: string;
  description?: string;
  image?: string;
  workspaceId: string;
  benefits: CouponRuleBenefit[];
  terms: CouponRuleTerm[];
  isCumulative: boolean;
  isActive: boolean;
  isArchived?: boolean;
}

// ======================= Start Benefit Type Datas =======================
export enum DiscountType {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export interface DiscountOnTotalData {
  type?: DiscountType;
  value?: number;
}

export interface DiscountOnProductData {
  type?: DiscountType;
  value?: number;
  productId?: string;
  product?: ProductEntity;
}

export interface FreeOnProductData {
  productId?: string;
  product?: ProductEntity;
  quantity?: number;
}
// ======================= End Benefit Type Datas =======================

export interface CouponDto {
  ruleId: string;
  quantity: number;
  code?: string;
  expiredAt?: number;
  customerId?: string;
  receiptId?: string;
  ticketId?: string;
  isArchived?: boolean;
}

export interface CouponEntity extends BaseMongoEntity {
  ruleId: string;
  rule: CouponRuleEntity;
  workspaceId: string;
  quantity: number;
  code?: string;
  customerId?: string;
  customer?: CustomerEntity;
  receiptId?: string;
  ticketId?: string;
  expiredAt?: number;
  isArchived?: boolean;
}