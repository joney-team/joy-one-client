import { IsArray, ValidateNested } from 'class-validator';

import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EntitySource, Gender } from '../app.types';
import { LocationEntity, LocationInput } from '../locations/locations.types';
import { CustomerRelationshipContactInput } from './customers.types';

@InputType()
export class CustomerInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  plainCode?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  birthday?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatar?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  socialFacebookUrl?: string;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  location?: LocationInput;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  secondaryLocation?: LocationInput;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  vnLocation?: LocationEntity;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  vnSecondaryLocation?: LocationEntity;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  presenterCustomerId?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  salaryAmount?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  relatedCustomerIds?: string[];

  @Field(() => [CustomerRelationshipContactInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerRelationshipContactInput)
  @IsOptional()
  relationshipContacts?: CustomerRelationshipContactInput[];

  @Field(() => Gender, { nullable: true })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @Field(() => [String], { nullable: true })
  @IsArray({ each: true })
  @IsOptional()
  medicalHistory: string[];

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  assigneeUserIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray({ each: true })
  @IsOptional()
  tagIds?: string[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  createdAt?: number;

  @Field(() => EntitySource, { nullable: true })
  @IsEnum(EntitySource)
  @IsOptional()
  source?: EntitySource;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  workspaceBranchId?: string;
}

@InputType()
export class AssignCustomerInput {
  @Field(() => [String])
  @IsString({ each: true })
  userIds: string[];
}

export class CustomerDeviceDto {
  @ApiProperty()
  @IsString()
  deviceId: string;
}

export class CustomerAuthWithZaloInput {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class CustomerAuthInput {
  @ApiProperty()
  @IsString()
  accessToken: string;
}

export class CustomerRefreshTokenInput {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
