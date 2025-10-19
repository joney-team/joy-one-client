import { renderFileUrl } from "@/modules/files/files-utils";
import { getWorkspaceMetadata } from "@/modules/workspaces/utils";
import { isExtendedApp } from "@/service";
import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  if (isExtendedApp()) {
    const { get } = await headers();
    const metadata = await getWorkspaceMetadata({
      host: get("host") as string,
      workspaceId: get("x-workspace-id") as string,
    });

    const _manifest: MetadataRoute.Manifest = {
      name: metadata.appName,
      short_name: metadata.appName,
      display: "standalone",
      start_url: "/",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: renderFileUrl(metadata.appIcon)!,
          sizes: "any",
          type: "image/png",
        },
      ],
    };

    return _manifest;
  }

  return {
    name: "JoyOne",
    short_name: "JoyOne",
    description: "Trợ thủ Chăm sóc khánh hàng - Quản lí doanh nghiệp",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/app-icon.png",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
