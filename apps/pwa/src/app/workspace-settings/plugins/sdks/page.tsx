"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";

const WorkspaceSdks = renderPage(() =>
  import("@/modules/workspace-sdks/workspace-sdk-list").then((mod) => mod.WorkspaceSdkList)
);

const Content = () => {
  return (
    <Container p={16}>
      <WorkspaceSdks />
    </Container>
  );
};

export default () => <Layout component={Content} />;
