import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class WorkspaceApiAppInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workspaceBranchIds?: string[];

  @Field(() => Boolean)
  @IsBoolean()
  enabled: boolean;
}
