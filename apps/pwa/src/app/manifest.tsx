import { getAppMetadata } from "@/modules/metadata/metadata-service";
import { isExtendedApp } from "@/service";
import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  if (isExtendedApp()) {
    const { get } = await headers();
    const metadata = await getAppMetadata({
      domain: get("host"),
    });

    return {
      name: metadata.name,
      short_name: metadata.name,
      display: "standalone",
      start_url: "/",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: metadata.icon,
          sizes: "any",
          type: "image/png",
        },
      ],
    };
  }

  return {
    name: "JoyOne1",
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
