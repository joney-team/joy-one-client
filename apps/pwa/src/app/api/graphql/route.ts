"use server";

import { StorageKey } from "@/constants/storage-key";
import config from "@joy-one-client/config";
import { cookies } from "next/headers";

const forwardHeaders = ["x-device-id", "x-session-id", "x-workspace-id", "accept-language"];

export async function POST(req: Request) {
  const [body, cookieStore] = await Promise.all([req.text(), cookies()]);

  const response = await fetch(config.API_SERVER_SIDE_URL + "/graphql", {
    method: "POST",
    headers: {
      ...Object.fromEntries(forwardHeaders.map((header) => [header, req.headers.get(header)])),
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookieStore.get(StorageKey.ACCESS_TOKEN)?.value}`,
    },
    body,
  });

  const responseText = await response.text();
  const responseStatus = response.status;

  return new Response(responseText, {
    status: responseStatus,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
