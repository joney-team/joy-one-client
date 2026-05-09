import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderItemInput, OrderType } from './orders.types';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OrderInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => OrderType)
  @IsEnum(OrderType)
  type: OrderType;

  @Field(() => [OrderItemInput])
  @IsArray()
  items: OrderItemInput[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  comboIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  promotionIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  assigneeUserIds?: string[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  directDiscount?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  relatedUserIds?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

@InputType()
export class CalculateOrderInput extends OrderInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;
}
