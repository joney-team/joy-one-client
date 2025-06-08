import { CreateUserDto, UserEntity } from "./users";

export type UserAuthResult = Pick<UserEntity,
  | '_id'
  | 'name'
  | 'email'
  | 'avatar'
  | 'role'
  | 'locale'
  | 'settings'
  | 'phone'
  | 'isEmailVerified'
  | 'birthday'
> & {
  isPasswordProvided: boolean;
}

export type AuthTokenResult = {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSignInWithFirebaseDto {
  idToken: string;
  username?: string;
}

export interface AuthSignInWithFacebookDto {
  accessToken: string;
}

export interface AuthSignInWithEmailPasswordDto {
  email: string;
  password: string;
}
export interface AuthRefreshTokenDto {
  refreshToken: string;
}

export interface AuthSignUpWithEmailPasswordDto extends CreateUserDto { }

export interface AuthSignOutOtherDevicesDto {
  deviceId: string;
}

export interface AuthRequestRenewUserPasswordDto {
  email: string;
}

export interface AuthVerifyRenewPasswordCodeDto {
  code: string;
}

export interface AuthRenewPasswordByCodeDto {
  code: string;
  plainPassword: string;
}