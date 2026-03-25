"use server";

import config from "@joy-one-client/config";

export async function GET() {
  return new Response(
    JSON.stringify({
      ENV: config.ENV,
      API_CLIENT_SIDE_URL: config.API_CLIENT_SIDE_URL,
      API_SERVER_SIDE_URL: config.API_SERVER_SIDE_URL,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
