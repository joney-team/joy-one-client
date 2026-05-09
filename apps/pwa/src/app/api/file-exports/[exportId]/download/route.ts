"use server";

import { StorageKey } from "@/constants/storage-key";
import config from "@joy-one/config";
import { cookies } from "next/headers";

const forwardHeaders = ["x-device-id", "x-session-id", "x-workspace-id", "accept-language"];

export async function GET(req: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const { exportId } = await params;
  const cookieStore = await cookies();

  const response = await fetch(
    config.API_SERVER_SIDE_URL + `/file-exports/${exportId}/download`,
    {
      method: "GET",
      headers: {
        ...Object.fromEntries(forwardHeaders.map((header) => [header, req.headers.get(header)])),
        Authorization: `Bearer ${cookieStore.get(StorageKey.ACCESS_TOKEN)?.value}`,
      },
    },
  );

  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition");

  const headers = new Headers({ "Content-Type": contentType });
  if (contentDisposition) headers.set("Content-Disposition", contentDisposition);

  return new Response(response.body, { status: 200, headers });
}
