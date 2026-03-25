import { UpdateUserProfileInput } from "@/graphql/types.graphql";
import { DeviceEntity } from "@/modules/devices/devices-types";
import { AuthUserFragment } from "./graphql/fragmentAuthUser.graphql";

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

export interface AuthRefreshTokenInput {
  refreshToken: string;
}

export interface AuthContext {
  user: AuthUserFragment;
  device: DeviceEntity;
  isInitialized: boolean;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  updateProfile: (values: UpdateUserProfileInput) => Promise<void>;
  signInWithEmailAndPassword: (dto: AuthSignInWithEmailPasswordDto) => Promise<void>;
  signUpWithEmailPassword: (dto: AuthSignUpWithEmailPasswordDto) => Promise<void>;
  registerNotification: () => Promise<void>;
  signOutOtherDevices: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}
