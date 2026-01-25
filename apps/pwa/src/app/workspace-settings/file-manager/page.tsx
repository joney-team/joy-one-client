"use client";

import { Layout, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/files/files-manager").then((mod) => mod.FilesManager)
);
export default () => <Layout component={Content} />;
