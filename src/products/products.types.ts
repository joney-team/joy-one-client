import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CustomFieldValueInput } from '../custom-fields/custom-fields.types';

@ObjectType()
export class ProductSupply {
  @Field(() => String)
  productId: string;

  @Field(() => Number)
  quantity: number;
}

@InputType()
export class ProductSupplyInput {
  @Field(() => String)
  @IsString()
  productId: string;

  @Field(() => Number)
  @IsNumber()
  quantity: number;
}

@ObjectType()
export class ProductComboValue {
  @Field(() => String)
  productId: string;

  @Field(() => Number)
  quantity: number;
}

@InputType()
export class ProductComboInput {
  @Field(() => String)
  @IsString()
  productId: string;

  @Field(() => Number)
  @IsNumber()
  quantity: number;
}

export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  COMBO = 'COMBO',
  VOUCHER = 'VOUCHER',
}

registerEnumType(ProductType, {
  name: 'ProductType',
  description: 'Available product types',
});

@InputType()
export class ProductInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @Field(() => String)
  @IsString()
  unit: string;

  @Field(() => Number)
  @IsNumber()
  price: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @Field(() => ProductType)
  @IsEnum(ProductType)
  type: ProductType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  productCode?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  defaultQtyPerUse?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isStockCheck?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isHiddenInReceiptWhenNoPrice?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  warningOutOfDateBeforeDays?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  warningOutOfStockQty?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @Field(() => [ProductSupplyInput], { nullable: true })
  @IsArray()
  @IsOptional()
  supplies?: ProductSupplyInput[];

  @Field(() => [ProductComboInput], { nullable: true })
  @IsArray()
  @IsOptional()
  combos?: ProductComboInput[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  combosExpireInDays?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  voucherAmount?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  voucherExpireInDays?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  voucherExcludeProductIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  voucherIncludeProductIds?: string[];

  @Field(() => [CustomFieldValueInput], { nullable: true })
  @IsArray()
  @IsOptional()
  customFieldValues?: CustomFieldValueInput[];
}
