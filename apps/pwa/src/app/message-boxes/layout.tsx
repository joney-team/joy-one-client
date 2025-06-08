"use client";

import { Layout, PageProps, renderPage } from "@/layout/layout-page";

const Content = renderPage(() => import("./layout-content"));

export default (props: PageProps) => <Layout component={Content} {...props} />;
