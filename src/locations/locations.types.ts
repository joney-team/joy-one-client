import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export enum LocationType {
  province = 'province',
  district = 'district',
  ward = 'ward',
}

registerEnumType(LocationType, {
  name: 'LocationType',
  description: 'The type of location (province, district, ward)',
});

@ObjectType()
export class Coordinates {
  @Field(() => Number)
  lat: number;

  @Field(() => Number)
  lng: number;
}

@InputType()
export class CoordinatesInput {
  @Field(() => Number)
  @IsNumber()
  lat: number;

  @Field(() => Number)
  @IsNumber()
  lng: number;
}

@ObjectType()
export class VnLocation {
  @Field()
  id: string;

  @Field(() => LocationType)
  type: LocationType;

  @Field()
  name: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  externalId?: string;
}

@ObjectType('Location')
export class LocationEntity {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  provinceId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  districtId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  wardId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => Coordinates, { nullable: true })
  @IsObject()
  @IsOptional()
  coordinates?: Coordinates;
}

@InputType()
export class LocationInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  provinceId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  districtId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  wardId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsObject()
  @IsOptional()
  coordinates?: CoordinatesInput;
}
