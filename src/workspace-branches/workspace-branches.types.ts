import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocationInput } from '../locations/locations.types';
import {
  PluginBankAccount,
  PluginBankAccountInput,
} from '../plugin-banks/plugin-banks.types';

@ObjectType()
export class WorkspaceBranchSettings {
  @Field(() => PluginBankAccount, { nullable: true })
  bankAccount?: PluginBankAccount;
}

@InputType()
export class WorkspaceBranchSettingsInput {
  @Field(() => PluginBankAccountInput, { nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PluginBankAccountInput)
  bankAccount?: PluginBankAccountInput;
}

@InputType()
export class WorkspaceBranchInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  hotline?: string;

  @Field(() => LocationInput, { nullable: true })
  @IsObject()
  @IsOptional()
  location?: LocationInput;

  @Field(() => WorkspaceBranchSettingsInput, { nullable: true })
  @IsOptional()
  settings?: WorkspaceBranchSettings;
}
