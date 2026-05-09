import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLAnyType } from '../graphql/graphql-type';
import { LocationInput } from '../locations/locations.types';
import { CustomerFormStatus } from './customer-forms.types';

@InputType()
export class CustomerFormInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  phone: string;

  @Field()
  @IsString()
  workspaceId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @IsObject()
  @IsOptional()
  dynamicData?: any;

  @Field(() => CustomerFormStatus, { nullable: true })
  @IsEnum(CustomerFormStatus)
  @IsOptional()
  status?: CustomerFormStatus;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  location?: LocationInput;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  vnLocation?: LocationInput;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cancelReason?: string;
}

@InputType()
export class BulkArchiveInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
