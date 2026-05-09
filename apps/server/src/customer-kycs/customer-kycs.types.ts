import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocationEntity, LocationInput } from '../locations/locations.types';
import { Gender } from '../app.types';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum CustomerKycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(CustomerKycStatus, {
  name: 'CustomerKycStatus',
  description: 'Customer KYC status',
});

@InputType()
export class CustomerKycInput {
  @Field()
  @IsString()
  cidNumber: string;

  @Field()
  @IsString()
  cidFullName: string;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  cidLocation?: LocationInput;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  cidVnLocation?: LocationInput;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  cidCreatedAt?: number;

  @Field(() => Gender)
  @IsEnum(Gender)
  cidGender: Gender;

  @Field()
  @IsNumber()
  cidBirthday: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cidRaw?: string;

  @Field()
  @IsString()
  frontOfCidImage: string;

  @Field()
  @IsString()
  backOfCidImage: string;

  @Field()
  @IsString()
  portraitImage: string;
}

@ObjectType()
export class CustomerKycVersion {
  @Field()
  id: string;

  @Field()
  frontOfCidImage: string;

  @Field()
  backOfCidImage: string;

  @Field()
  portraitImage: string;

  @Field()
  cidNumber: string;

  @Field()
  cidFullName: string;

  @Field(() => LocationEntity, { nullable: true })
  cidLocation?: LocationEntity;

  @Field(() => LocationEntity, { nullable: true })
  cidVnLocation?: LocationEntity;

  @Field({ nullable: true })
  cidRaw?: string;

  @Field(() => Gender)
  cidGender: Gender;

  @Field()
  cidBirthday: number;

  @Field({ nullable: true })
  cidCreatedAt?: number;

  @Field()
  createdAt: number;

  @Field({ nullable: true })
  rejectReason?: string;

  @Field(() => CustomerKycStatus)
  status?: CustomerKycStatus;
}

@InputType()
export class RejectCustomerKycInput {
  @Field()
  @IsString()
  reason: string;
}
