"use server";

import { StorageKey } from "@/constants/storage-key";
import type { AuthTokenResult } from "@/graphql/types.graphql";
import { apiServerSide } from "@/modules/apis/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(StorageKey.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return new Response(JSON.stringify({ isUnauthorized: false }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authTokenResult = await apiServerSide
      .post<AuthTokenResult>("/auth/refresh-token", {
        refreshToken,
      })
      .catch(() => null);

    if (authTokenResult) {
      await Promise.all([
        cookieStore.set(StorageKey.ACCESS_TOKEN, authTokenResult.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 15,
        }),
        cookieStore.set(StorageKey.REFRESH_TOKEN, authTokenResult.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        }),
      ]);
    }

    return new Response(JSON.stringify({ isUnauthorized: Boolean(authTokenResult) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ isUnauthorized: false }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
