import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { GraphQLAnyType } from 'src/graphql/graphql-type';

export enum DynamicSelectionOperator {
  INCLUDES = 'INCLUDES',
  EXCLUDES = 'EXCLUDES',
}

registerEnumType(DynamicSelectionOperator, {
  name: 'DynamicSelectionOperator',
  description: 'DynamicSelectionOperator',
});

@ObjectType()
export class DynamicSelection {
  @Field({ nullable: true })
  entity?: string;

  @Field(() => DynamicSelectionOperator)
  operator: DynamicSelectionOperator;

  @Field(() => [GraphQLAnyType])
  value: any[];
}

@InputType()
export class DynamicSelectionInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  entity?: string;

  @Field(() => DynamicSelectionOperator)
  @IsEnum(DynamicSelectionOperator)
  operator: DynamicSelectionOperator;

  @Field(() => [GraphQLAnyType])
  @IsArray()
  value: any[];
}
