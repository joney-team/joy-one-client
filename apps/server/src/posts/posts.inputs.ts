import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CustomFieldValueInput } from '../custom-fields/custom-fields.types';
import { JSONContent } from './posts.types';
import { Field, InputType } from '@nestjs/graphql';
import { GraphQLAnyType, GraphQLJSONObject } from 'src/graphql/graphql-type';

@InputType()
export class PostInput {
  @Field()
  @IsString()
  @MinLength(1)
  title: string;

  @Field({ nullable: true })
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  content?: JSONContent;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  contentHtml?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @IsObject()
  @IsOptional()
  meta?: any;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  productId?: string;

  @Field(() => [CustomFieldValueInput], { nullable: true })
  @IsArray()
  @IsOptional()
  customFieldValues?: CustomFieldValueInput[];
}

@InputType()
export class GenerateSlugInput {
  @Field()
  @IsString()
  title: string;
}
