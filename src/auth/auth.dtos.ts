import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { CreateUserInput } from '../users/users.types';

@InputType()
export class AuthSignInWithFirebaseInput {
  @Field()
  @IsString()
  idToken: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  username?: string;
}

@InputType()
export class AuthSignInWithFacebookInput {
  @Field()
  @IsString()
  accessToken: string;
}

@InputType()
export class AuthSignInWithEmailPasswordInput {
  @Field(() => String)
  @IsString()
  email: string;

  @Field(() => String)
  @IsString()
  password: string;
}

@InputType()
export class AuthRefreshTokenInput {
  @Field()
  @IsString()
  refreshToken: string;
}

@InputType()
export class AuthSignUpWithEmailPasswordInput extends CreateUserInput {}

@InputType()
export class AuthRequestRenewUserPasswordInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class AuthVerifyRenewPasswordCodeInput {
  @Field()
  @IsString()
  code: string;
}

@InputType()
export class AuthRenewPasswordByCodeInput {
  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  plainPassword: string;
}
