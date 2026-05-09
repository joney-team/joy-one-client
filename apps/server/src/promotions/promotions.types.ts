import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CustomFieldValueInput } from '../custom-fields/custom-fields.types';
import { DynamicSelectionInput } from '../utils/dynamic-selection';
import { PromotionEntity } from './entities/promotion.entity';

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(PromotionStatus, {
  name: 'PromotionStatus',
  description: 'Promotion status',
});

export enum PromotionType {
  DISCOUNT_RATE = 'DISCOUNT_RATE',
  DISCOUNT_AMOUNT = 'DISCOUNT_AMOUNT',
}

registerEnumType(PromotionType, {
  name: 'PromotionType',
  description: 'Promotion type',
});

@InputType()
export class PromotionInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  expireAt?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  limitPerCustomer?: number;

  @Field(() => PromotionType)
  @IsEnum(PromotionType)
  type: PromotionType;

  @Field()
  @IsNumber()
  value: number;

  @Field(() => DynamicSelectionInput, { nullable: true })
  @IsObject()
  productsSelection?: DynamicSelectionInput;

  @Field(() => DynamicSelectionInput, { nullable: true })
  @IsObject()
  customersSelection?: DynamicSelectionInput;

  @Field(() => PromotionStatus, { nullable: true })
  @IsEnum(PromotionStatus)
  @IsOptional()
  status?: PromotionStatus;

  @Field(() => [CustomFieldValueInput], { nullable: true })
  @IsArray()
  @IsOptional()
  customFieldValues?: CustomFieldValueInput[];
}

@InputType()
export class UpdatePromotionStatusInput {
  @Field(() => PromotionStatus)
  @IsEnum(PromotionStatus)
  status: PromotionStatus;
}

export class UsePromotionInput {
  ref: string;
  promotionId: string;
  customerId: string;
  orderId?: string;
  note?: string;
  promotion?: PromotionEntity;
}
