import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

export enum UserAuthSessionType {
  RENEW_PASSWORD = 'RENEW_PASSWORD',
}

registerEnumType(UserAuthSessionType, {
  name: 'UserAuthSessionType',
  description: 'User auth session type',
});

@InputType()
export class RequestRenewUserPasswordInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class RenewUserPasswordInput {
  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  plainPassword: string;
}

@InputType()
export class VerifyRenewPasswordInput {
  @Field()
  @IsString()
  code: string;
}

@ObjectType()
export class VerifyRenewPasswordResult {
  @Field()
  email: string;
}
