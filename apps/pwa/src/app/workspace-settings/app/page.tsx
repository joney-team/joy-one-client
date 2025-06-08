"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const WorkspaceAppSettings = renderPage(() =>
  import("@/modules/workspace-settings/components/workspace-setting-app").then((mod) => mod.WorkspaceAppSettings)
);

const Content = () => {
  return (
    <Container p={16}>
      <Card shadow="xs">
        <WorkspaceAppSettings />
      </Card>
    </Container>
  );
};

export default () => <Layout component={Content} />;
