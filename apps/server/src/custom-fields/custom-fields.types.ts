import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppEntity } from '../app.types';
import { GraphQLAnyType, GraphQLJSONObject } from '../graphql/graphql-type';

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  TEXTAREA = 'TEXTAREA',
  FILE = 'FILE',
  SWITCH = 'SWITCH',
}

registerEnumType(CustomFieldType, {
  name: 'CustomFieldType',
  description: 'Available custom field types',
});

@ObjectType()
export class BaseCustomFieldValue {
  @Field(() => String)
  @IsString()
  customFieldId: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @IsObject()
  value?: unknown;
}

@InputType()
export class CustomFieldValueInput {
  @Field(() => String)
  @IsString()
  customFieldId: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @IsObject()
  @IsOptional()
  value?: unknown;
}

@InputType()
export class CustomFieldInput {
  @Field(() => CustomFieldType)
  @IsEnum(CustomFieldType)
  type: CustomFieldType;

  @Field()
  @IsString()
  label: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  key?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  config?: any;

  @Field(() => [String])
  @IsArray()
  @IsEnum(AppEntity, { each: true })
  entities: AppEntity[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;
}

@ObjectType()
export class CustomFieldValue {
  @Field(() => CustomFieldType)
  @IsEnum(CustomFieldType)
  type: CustomFieldType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  key: string | null;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  config?: object;

  @Field(() => String)
  @IsString()
  customFieldId: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @IsObject()
  value?: unknown;
}
