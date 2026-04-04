"use server";

import { StorageKey } from "@/constants/storage-key";
import type {
  AuthSignInWithEmailPasswordInput,
  AuthSignUpWithEmailPasswordInput,
  AuthTokenResult,
} from "@/graphql/types.graphql";
import { withServerAction } from "@/utils/server.utils";
import { cookies } from "next/headers";
import { restServerClient } from "../apis/rest-server";
import type { AuthRefreshTokenInput } from "./auth-types";

export async function saveServerTokens(tokens: AuthTokenResult) {
  const cookieStore = await cookies();

  await Promise.all([
    cookieStore.set(StorageKey.ACCESS_TOKEN, tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 15,
    }),
    cookieStore.set(StorageKey.REFRESH_TOKEN, tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    }),
  ]);
}

export const serverSignInWithEmailPassword = withServerAction(
  async (input: AuthSignInWithEmailPasswordInput) => {
    const result = await restServerClient.post<AuthTokenResult>(
      "/auth/sign-in/email-password",
      input,
    );
    await saveServerTokens(result);
    return result;
  },
);

export const serverSignInWithFacebook = withServerAction(async (accessToken: string) => {
  const result = await restServerClient.post<AuthTokenResult>("/auth/sign-in/facebook", {
    accessToken,
  });
  await saveServerTokens(result);
  return result;
});

export const serverSignInWithFirebase = withServerAction(
  async (idToken: string, username?: string) => {
    const result = await restServerClient.post<AuthTokenResult>("/auth/sign-in/firebase", {
      idToken,
      username,
    });

    await saveServerTokens(result);
    return result;
  },
);

export const serverSignUpWithEmailPassword = withServerAction(
  async (input: AuthSignUpWithEmailPasswordInput) => {
    const result = await restServerClient.post<AuthTokenResult>(
      "/auth/sign-up/email-password",
      input,
    );
    await saveServerTokens(result);
    return result;
  },
);

export const serverRefreshToken = async (input: AuthRefreshTokenInput) => {
  return restServerClient.post<AuthTokenResult>("/auth/refresh-token", input);
};

export const serverSignOutOtherDevices = withServerAction(async () => {
  const result = await restServerClient.post<AuthTokenResult>("/auth/sign-out-other-devices");
  await saveServerTokens(result);
  return result;
});

export const serverSignOut = withServerAction(async () => {
  const cookieStore = await cookies();
  await Promise.all([
    cookieStore.delete(StorageKey.ACCESS_TOKEN),
    cookieStore.delete(StorageKey.REFRESH_TOKEN),
  ]);
});

export const serverGetAccessToken = withServerAction(async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(StorageKey.REFRESH_TOKEN)?.value;
  if (!refreshToken) return null;

  try {
    const result = await serverRefreshToken({ refreshToken });
    await saveServerTokens(result);
    return result.accessToken;
  } catch (error) {
    return null;
  }
});

export const serverCheckAuthStatus = withServerAction(async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(StorageKey.REFRESH_TOKEN)?.value;
  return Boolean(refreshToken);
});
