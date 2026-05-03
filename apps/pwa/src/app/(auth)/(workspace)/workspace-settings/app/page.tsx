"use client";

import { Container } from "@/components/container";
import { renderPage } from "@/layout/layout-page";
import { Card, Skeleton } from "@mantine/core";

const WorkspaceAppSettings = renderPage(
  () =>
    import("@/modules/workspace-settings/components/workspace-setting-app").then(
      (mod) => mod.WorkspaceAppSettings,
    ),
  () => <Skeleton height={150} />,
);

const Content = () => {
  return (
    <Container p="md">
      <Card shadow="xs">
        <WorkspaceAppSettings />
      </Card>
    </Container>
  );
};

export default Content;
