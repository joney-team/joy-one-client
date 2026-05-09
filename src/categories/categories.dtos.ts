import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CustomFieldValueInput } from '../custom-fields/custom-fields.types';
import { CategoryType } from './categories.types';

@InputType()
export class CategoryInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => CategoryType, { nullable: true })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;

  @Field(() => [CustomFieldValueInput], { nullable: true })
  @IsArray()
  @IsOptional()
  customFieldValues?: CustomFieldValueInput[];
}

export class CategorySortItemInput {
  @IsString()
  id: string;

  @IsNumber()
  order: number;
}

export class CategorySortInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategorySortItemInput)
  items: CategorySortItemInput[];
}

@InputType()
export class GenerateCategorySlugInput {
  @Field(() => String)
  @IsString()
  name: string;
}
