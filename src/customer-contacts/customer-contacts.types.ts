import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsString } from 'class-validator';

@ObjectType('CustomerContactInformation')
export class CustomerContact {
  @Field()
  name: string;

  @Field(() => [String])
  phones: string[];
}

@InputType()
export class CustomerContactInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [String])
  @IsArray()
  phones: string[];
}

@InputType()
export class SetCustomerContactsInput {
  @Field(() => [CustomerContactInput])
  @IsArray()
  contacts: CustomerContactInput[];
}
