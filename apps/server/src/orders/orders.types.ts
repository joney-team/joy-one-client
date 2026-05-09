import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductType } from 'src/products/products.types';
import { TransactionNode } from '../database/database.types';
import { ProductStock } from '../product-stocks/product-stocks.types';
import { ProductEntity } from '../products/entities/product.entity';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';

export enum OrderType {
  COMMON = 'COMMON',
}

registerEnumType(OrderType, {
  name: 'OrderType',
  description: 'Order type',
});

export enum OrderPaymentStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

registerEnumType(OrderPaymentStatus, {
  name: 'OrderPaymentStatus',
  description: 'Order payment status',
});

@InputType()
export class OrderItemInput {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsNumber()
  quantity: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  price?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigneeUserIds?: string[];
}

export interface OrderColumnItem extends OrderItemInput {
  price: number;
  revenue: number;
  revenueRate: number;
}

export enum OrderDiscountType {
  DIRECT = 'DIRECT',
  COMBO = 'COMBO',
  PROMOTION = 'PROMOTION',
}

registerEnumType(OrderDiscountType, {
  name: 'OrderDiscountType',
  description: 'Order discount type',
});

@ObjectType()
export class OrderDiscount {
  @Field()
  amount: number;

  @Field(() => OrderDiscountType)
  type: OrderDiscountType;

  @Field({ nullable: true })
  productId?: string;

  @Field({ nullable: true })
  productQuantity?: number;

  @Field({ nullable: true })
  productComboId?: string;

  @Field({ nullable: true })
  promotionId?: string;
}

export interface OrderCalculated {
  discounts: OrderDiscount[];
  items: OrderColumnItem[];
  subTotalAmount: number;
  discountAmount: number;
  totalAmount: number;
}

@InputType()
export class PayOrderInput {
  @Field()
  @IsNumber()
  amount: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  tipAmount?: number;
}

export type OrderProductHandlerContext = {
  member: WorkspaceMember;
  orderId: string;
  workspaceBranchId?: string;
  customerId: string;
  product: ProductEntity;
  productPrice?: number | null;
  productStock: ProductStock;
  orderDtoItem: OrderItemInput;
  node: TransactionNode;
  isValidate: boolean;
};

@ObjectType()
export class OrdersMetricsReport {
  @Field()
  todayOrders: number;
}

@ObjectType()
export class OrderItemProduct {
  @Field()
  _id: string;

  @Field(() => ProductType)
  type: ProductType;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  unit?: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  minPrice?: number;

  @Field({ nullable: true })
  maxPrice?: number;

  @Field({ nullable: true })
  defaultQtyPerUse?: number;

  @Field({ nullable: true })
  isHiddenInReceiptWhenNoPrice?: boolean;
}

@ObjectType()
export class OrderItem {
  @Field()
  productId: string;

  @Field(() => OrderItemProduct)
  product: OrderItemProduct;

  @Field()
  quantity: number;

  @Field()
  price: number;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [String], { nullable: true })
  assigneeUserIds?: string[];

  @Field()
  revenue: number;

  @Field()
  revenueRate: number;

  @Field(() => [WorkspaceMemberPublicInfo])
  assigneeUsers: WorkspaceMemberPublicInfo[];
}
