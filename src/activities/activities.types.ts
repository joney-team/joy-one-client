import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DynamicPaginatedArgs } from '../database/database.utils';

export enum ActivityType {
  COMMON = 'COMMON',
  COMMENT = 'COMMENT',
}

registerEnumType(ActivityType, {
  name: 'ActivityType',
  description: 'Available activity types',
});

@ArgsType()
export class AddActivityArgs {
  @Field(() => String)
  @IsString()
  contextType: string;

  @Field(() => String)
  @IsString()
  contextId: string;

  @Field(() => ActivityType)
  @IsEnum(ActivityType)
  type: ActivityType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}

@ArgsType()
export class GetActivityArgs {
  @Field(() => String)
  @IsString()
  id: string;
}

@ArgsType()
export class UpdateActivityArgs extends GetActivityArgs {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;
}

@ArgsType()
export class ActivityPaginatedArgs extends DynamicPaginatedArgs {
  @Field()
  @IsString()
  contextType: string;

  @Field()
  @IsString()
  contextId: string;

  @Field(() => ActivityType, { nullable: true })
  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}
