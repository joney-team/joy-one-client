"use server";

import { StorageKey } from "@/constants/storage-key";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const body = await req.json();

  if (body.accessToken) {
    cookieStore.set(StorageKey.ACCESS_TOKEN, body.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 15,
    });
  }

  if (body.refreshToken) {
    cookieStore.set(StorageKey.REFRESH_TOKEN, body.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  cookieStore.set("auth_migrated", "true", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const authMigrated = cookieStore.get("auth_migrated")?.value;

  return new Response(JSON.stringify({ isMigrated: !!authMigrated }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
