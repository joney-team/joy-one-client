import { DeviceEntity } from "@/modules/devices/devices-types";
import { UpdateUserProfileDto, UserEntity } from "@/modules/users/users-types";

export type UserAuthResult = Pick<
  UserEntity,
  | "_id"
  | "name"
  | "email"
  | "avatar"
  | "role"
  | "locale"
  | "settings"
  | "phone"
  | "isEmailVerified"
  | "birthday"
> & {
  isPasswordProvided: boolean;
};

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

export interface AuthSignUpWithEmailPasswordDto {
  name: string;
  email: string;
  plainPassword: string;
  avatar?: string;
}

export interface AuthRefreshTokenDto {
  refreshToken: string;
}

export interface AuthSignUpWithEmailPasswordDto {
  name: string;
  email: string;
  plainPassword: string;
  avatar?: string;
}

export type AuthTokenResult = {
  accessToken: string;
  refreshToken: string;
};

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

export interface AuthContext {
  user: UserAuthResult;
  device: DeviceEntity;
  isInitialized: boolean;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  updateProfile: (values: UpdateUserProfileDto) => Promise<void>;
  signInWithEmailAndPassword: (dto: AuthSignInWithEmailPasswordDto) => Promise<void>;
  registerWithEmailAndPassword: (dto: AuthSignUpWithEmailPasswordDto) => Promise<void>;
  registerNotification: () => Promise<void>;
  signOutOtherDevices: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}
