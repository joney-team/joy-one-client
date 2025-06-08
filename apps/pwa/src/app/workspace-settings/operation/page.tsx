"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const WorkspaceOperationSettings = renderPage(() =>
  import("@/modules/workspace-settings/components/workspace-setting-operation").then(
    (mod) => mod.WorkspaceOperationSettings
  )
);

const Content = () => {
  return (
    <Container p={16}>
      <Card shadow="xs">
        <WorkspaceOperationSettings />
      </Card>
    </Container>
  );
};

export default () => <Layout component={Content} />;
