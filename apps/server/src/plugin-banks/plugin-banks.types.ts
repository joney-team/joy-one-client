import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class BankInformation {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field()
  bin: string;

  @Field()
  shortName: string;

  @Field()
  logo: string;

  @Field()
  transferSupported: number;

  @Field()
  lookupSupported: number;

  @Field()
  short_name: string;

  @Field()
  support: number;

  @Field()
  isTransfer: number;

  @Field({ nullable: true })
  swift_code?: string;
}

@ObjectType()
export class BankInforationsResult {
  @Field(() => [BankInformation])
  results: BankInformation[];

  @Field()
  total: number;
}

@InputType()
export class GetBankAccountInformationInput {
  @Field()
  @IsString()
  bin: string;

  @Field()
  @IsString()
  accountNumber: string;
}

@ObjectType()
export class GetBankAccountInformationResult {
  @Field()
  accountName: string;
}

@ObjectType()
export class PluginBankAccount {
  @Field()
  bankId: number;

  @Field()
  accountNumber: string;

  @Field({ nullable: true })
  accountName?: string;
}

@InputType()
export class PluginBankAccountInput {
  @Field()
  @IsNumber()
  bankId: number;

  @Field()
  @IsString()
  accountNumber: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  accountName?: string;
}
