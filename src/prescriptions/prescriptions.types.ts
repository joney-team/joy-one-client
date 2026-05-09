import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

@ObjectType()
export class PrescriptionItemQty {
  @Field({ nullable: true })
  morning?: number;

  @Field({ nullable: true })
  noon?: number;

  @Field({ nullable: true })
  afternoon?: number;
}

@InputType()
export class PrescriptionItemQtyInput {
  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  morning?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  noon?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  afternoon?: number;
}

@ObjectType()
export class PrescriptionItem {
  @Field({ nullable: true })
  productId?: string;

  @Field()
  name: string;

  @Field()
  unit: string;

  @Field(() => PrescriptionItemQty)
  qty: PrescriptionItemQty;

  @Field()
  days: number;

  @Field({ nullable: true })
  note?: string;
}

@InputType()
export class PrescriptionItemInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  productId?: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  unit: string;

  @Field(() => PrescriptionItemQtyInput)
  @IsObject()
  qty: PrescriptionItemQtyInput;

  @Field()
  @IsNumber()
  days: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;
}

@InputType()
export class PrescriptionInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [PrescriptionItemInput])
  @IsArray()
  items: PrescriptionItemInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;
}
