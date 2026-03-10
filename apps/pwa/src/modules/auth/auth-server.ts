"use server";

import { cookies } from "next/headers";
import { apiServerSide } from "../apis/server";
import type {
  AuthMeDto,
  AuthRefreshTokenDto,
  AuthSignInWithEmailPasswordDto,
  AuthSignUpWithEmailPasswordDto,
  AuthTokenResult,
} from "./auth-types";
import type { AuthUserDataFragment } from "./graphql/fragmentAuthUser.graphql";
import { StorageKey } from "@/constants/storage-key";

export async function saveTokens(tokens: AuthTokenResult) {
  const cookieStore = await cookies();
  await Promise.all([
    cookieStore.set(StorageKey.ACCESS_TOKEN, tokens.accessToken),
    cookieStore.set(StorageKey.REFRESH_TOKEN, tokens.refreshToken),
  ]);
}

export const serverSignInWithEmailPassword = async (dto: AuthSignInWithEmailPasswordDto) => {
  const result = await apiServerSide.post<AuthTokenResult>("/auth/sign-in/email-password", dto);
  await saveTokens(result);
  return result;
};

export const serverSignInWithFacebook = async (accessToken: string) => {
  const result = await apiServerSide.post<AuthTokenResult>("/auth/sign-in/facebook", {
    accessToken,
  });
  await saveTokens(result);
  return result;
};

export const serverSignInWithFirebase = async (idToken: string, username?: string) => {
  const result = await apiServerSide.post<AuthTokenResult>("/auth/sign-in/firebase", {
    idToken,
    username,
  });

  await saveTokens(result);
  return result;
};

export const serverSignUpWithEmailPassword = async (dto: AuthSignUpWithEmailPasswordDto) => {
  const result = await apiServerSide.post<AuthTokenResult>("/auth/sign-up/email-password", dto);
  await saveTokens(result);
  return result;
};

export const serverAuthMe = async (dto: AuthMeDto) => {
  return apiServerSide.post<AuthUserDataFragment>("/auth/me", dto);
};

export const serverRefreshToken = async (dto: AuthRefreshTokenDto) => {
  return apiServerSide.post<AuthTokenResult>("/auth/refresh-token", dto);
};
