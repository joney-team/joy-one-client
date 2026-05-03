"use client";

import { Container } from "@/components/container";
import { renderPage } from "@/layout/layout-page";
import { Card, Skeleton } from "@mantine/core";

const WorkspaceOperationSettings = renderPage(
  () =>
    import("@/modules/workspace-settings/components/workspace-setting-operation").then(
      (mod) => mod.WorkspaceOperationSettings,
    ),
  () => <Skeleton height={150} />,
);

const Content = () => {
  return (
    <Container p="sm">
      <Card shadow="xs">
        <WorkspaceOperationSettings />
      </Card>
    </Container>
  );
};

export default Content;
