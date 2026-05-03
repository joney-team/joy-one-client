import { App } from "@/app";
import { ColorSchemeScript } from "@mantine/core";

import { headers } from "next/headers";

import type { Metadata } from "next";

import { ScriptsAnalytics } from "@/components/analytics/scripts-analytics";
import { type TemplateString } from "next/dist/lib/metadata/types/metadata-types";

import { GraphqlProvider } from "@/graphql/graphql-provider";
import { AppMetadata } from "@/graphql/types.graphql";
import { defaultAppMetadata } from "@/modules/metadata/metadata-constants";
import { getAppMetadata } from "@/modules/metadata/metadata-service";
import { isExtendedApp } from "@/service";

export async function generateMetadata(): Promise<Metadata> {
  let metadata: AppMetadata = defaultAppMetadata;

  if (isExtendedApp()) {
    const { get } = await headers();

    metadata = await getAppMetadata({
      domain: get("host") as string,
    });
  }

  const title: TemplateString = {
    template: `%s - ${metadata.name}`,
    default: metadata.name,
  };

  return {
    title,
    icons: {
      icon: metadata.icon,
      shortcut: metadata.icon,
      other: {
        rel: metadata.icon,
        url: metadata.icon,
      },
    },
    openGraph: {
      title: title,
      images: metadata.icon,
    },
  };
}

export default async function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  let metadata: AppMetadata = defaultAppMetadata;

  if (isExtendedApp()) {
    const { get } = await headers();
    metadata = await getAppMetadata({ domain: get("host") });
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
        <GraphqlProvider>
          <App metadata={metadata}>{props.children}</App>
        </GraphqlProvider>

        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/en_US/sdk.js"
        />
      </body>

      <ScriptsAnalytics />
    </html>
  );
}
