"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const Content = renderPage(() =>
  import("@/modules/message-boxes/message-boxes-layout").then((m) => m.MessageBoxesLayout)
);

export default (props: PageProps) => <Layout component={Content} {...props} />;
