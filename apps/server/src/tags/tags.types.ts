import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DynamicPaginatedArgs } from '../database/database.utils';

export enum TagType {
  CUSTOMER = 'CUSTOMER',
  MESSAGE_BOX = 'MESSAGE_BOX',
  TASK_FOLDER = 'TASK_FOLDER',
  TASK = 'TASK',
}

registerEnumType(TagType, {
  name: 'TagType',
  description: 'Available tag types',
});

@InputType()
export class TagInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;

  @Field(() => TagType)
  @IsEnum(TagType)
  type: TagType;
}

@InputType()
export class UpdateTagInput {
  @Field(() => String)
  @IsString()
  _id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;
}

@ArgsType()
export class BulkUpdateTagsArgs {
  @Field(() => [UpdateTagInput])
  @IsArray()
  items: UpdateTagInput[];
}
