"use client";

import { Container } from "@/components/container";
import { renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const WorkspaceInformation = renderPage(() =>
  import("@/modules/workspaces/components/workspace-information").then(
    (mod) => mod.WorkspaceInformation,
  ),
);

const Content = () => {
  return (
    <Container p="md">
      <Card shadow="xs">
        <WorkspaceInformation />
      </Card>
    </Container>
  );
};

export default Content;
