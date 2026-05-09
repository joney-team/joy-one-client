import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { AppLocale } from '../lang/lang.types';
import { UserRole, UserSettings } from '../users/users.types';
import { IsString } from 'class-validator';

@ObjectType()
export class AuthUser {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => AppLocale, { nullable: true })
  locale?: AppLocale;

  @Field(() => UserSettings, { nullable: true })
  settings?: UserSettings;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => Boolean, { nullable: true })
  isEmailVerified?: boolean;

  @Field(() => Number, { nullable: true })
  birthday?: number;

  @Field(() => Boolean)
  isPasswordProvided: boolean;
}

@ObjectType()
export class AuthTokenResult {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}
