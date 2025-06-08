import { BaseMongoEntity } from "@/types";
import { CustomerEntity } from "../customers/customer-types";
import { ProductEntity } from "../products/products-types";

export enum ProductVoucherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  OUT_OF_AMOUNT = 'OUT_OF_AMOUNT',
}

export interface ProductVoucherDto {
  ref: string;
  workspaceId: string;
  productVoucherId: string;
  customerId: string;
  amount: number;
  relatedTicketId?: string;
  excludeProductIds?: string[];
  includeProductIds?: string[];
  expireAt?: number;
}

export interface ProductVoucherEntity extends BaseMongoEntity {
  ref: string;
  workspaceId: string;
  productVoucherId: string;
  productVoucher: ProductEntity;
  remainAmount: number;
  customerId: string;
  customer: CustomerEntity;
  relatedTicketId: string;
  amount: number;
  expireInDays?: number;
  status: ProductVoucherStatus;
}
