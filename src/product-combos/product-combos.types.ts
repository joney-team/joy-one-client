import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductEntity } from 'src/products/entities/product.entity';

@ObjectType()
export class ProductComboHistoryRecord {
  @Field()
  productRefId: string;

  @Field()
  quantity: number;
}

@InputType()
export class ProductComboHistoryRecordInput {
  @Field()
  @IsString()
  productRefId: string;

  @Field()
  @IsNumber()
  quantity: number;
}

@ObjectType()
export class ProductComboRef {
  @Field()
  productRefId: string;

  @Field()
  productRefRevenue: number;

  @Field()
  quantity: number;

  @Field()
  quantityUsed: number;
}

@ObjectType()
export class ProductComboRefResult extends ProductComboRef {
  @Field(() => ProductEntity)
  product: ProductEntity;
}

@InputType()
export class ProductComboRefInput {
  @Field()
  @IsString()
  productRefId: string;

  @Field()
  @IsNumber()
  productRefRevenue: number;

  @Field()
  @IsNumber()
  quantity: number;

  @Field()
  @IsNumber()
  quantityUsed: number;
}

export enum ProductComboSourceType {
  ORDER = 'ORDER',
  MANUAL = 'MANUAL',
}

registerEnumType(ProductComboSourceType, {
  name: 'ProductComboSourceType',
  description: 'Product combo source type',
});

@InputType()
export class ProductComboInput {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsString()
  customerId: string;

  @Field(() => [ProductComboRefInput])
  @IsArray()
  refs: ProductComboRefInput[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  expireAt?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

export enum ProductComboStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  SOURCE_UNAVAILABLE = 'SOURCE_UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

registerEnumType(ProductComboStatus, {
  name: 'ProductComboStatus',
  description: 'Product combo status',
});

@InputType()
export class UseProductComboInput {
  @Field()
  @IsString()
  ref: string;

  @Field(() => [ProductComboHistoryRecordInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductComboHistoryRecordInput)
  records: ProductComboHistoryRecordInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  orderId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;
}
