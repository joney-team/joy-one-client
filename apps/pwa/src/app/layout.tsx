import { App } from "@/app";
import { ColorSchemeScript } from "@mantine/core";

import { headers } from "next/headers";

import type { Metadata } from "next";

import { getWorkspaceMetadata } from "@/modules/workspaces/utils";
import { type TemplateString } from "next/dist/lib/metadata/types/metadata-types";

import { defaultMetadata } from "@/configs/metadata.config";
import type { AppMetadata } from "@/types";

import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";
import "@xyflow/react/dist/style.css";
import "maplibre-gl/dist/maplibre-gl.css";

import "../styles/app.style.css";
import "../styles/react-big-calendar.css";
import { isExtendedApp } from "@/service";

export async function generateMetadata(): Promise<Metadata> {
  let metadata: AppMetadata = defaultMetadata;

  if (isExtendedApp()) {
    const { get } = await headers();

    metadata = await getWorkspaceMetadata({
      host: get("host") as string,
      workspaceId: get("x-workspace-id") as string,
    });
  }

  const title: TemplateString = {
    template: `%s - ${metadata.title}`,
    default: metadata.title,
  };

  return {
    title,
    description: metadata.description,
    icons: {
      icon: metadata.favicon,
      shortcut: metadata.favicon,
      other: {
        rel: metadata.favicon,
        url: metadata.favicon,
      },
    },
    openGraph: {
      title: title,
      description: metadata.description,
      images: metadata.thumbnailURL,
    },
  };
}

export default async function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  let metadata: AppMetadata = defaultMetadata;

  if (isExtendedApp()) {
    const _headers = await headers();
    metadata = await getWorkspaceMetadata({
      host: _headers.get("host") as string,
      workspaceId: _headers.get("x-workspace-id") as string,
    });
  }

  return (
    <html suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body suppressHydrationWarning tabIndex={-1}>
        <App metadata={metadata}>{props.children}</App>

        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/en_US/sdk.js"
        ></script>
      </body>
    </html>
  );
}
