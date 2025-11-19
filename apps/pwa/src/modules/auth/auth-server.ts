"use server";

import { apiServerSide } from "../apis/server";
import type {
  AuthMeDto,
  AuthRefreshTokenDto,
  AuthSignInWithEmailPasswordDto,
  AuthSignUpWithEmailPasswordDto,
  AuthTokenResult,
  UserAuthResult,
} from "./auth-types";

export const serverSignInWithEmailPassword = async (dto: AuthSignInWithEmailPasswordDto) => {
  return apiServerSide.post<AuthTokenResult>("/auth/sign-in/email-password", dto);
};

export const serverSignInWithFacebook = async (accessToken: string) => {
  return apiServerSide.post<AuthTokenResult>("/auth/sign-in/facebook", { accessToken });
};

export const serverSignInWithFirebase = async (idToken: string, username?: string) => {
  return apiServerSide.post<AuthTokenResult>("/auth/sign-in/firebase", { idToken, username });
};

export const serverSignUpWithEmailPassword = async (dto: AuthSignUpWithEmailPasswordDto) => {
  return apiServerSide.post<AuthTokenResult>("/auth/sign-up/email-password", dto);
};

export const serverAuthMe = async (dto: AuthMeDto) => {
  return apiServerSide.post<UserAuthResult>("/auth/me", dto);
};

export const serverRefreshToken = async (dto: AuthRefreshTokenDto) => {
  return apiServerSide.post<AuthTokenResult>("/auth/refresh-token", dto);
};
