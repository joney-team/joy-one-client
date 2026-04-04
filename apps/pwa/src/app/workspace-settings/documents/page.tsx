"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const WorkspaceTermsAndPolicies = renderPage(() =>
  import("@/modules/workspace-settings/components/workspace-setting-terms-and-policies").then(
    (mod) => mod.WorkspaceTermsAndPolicies,
  ),
);

const Content = () => {
  return (
    <Container p="md">
      <Card shadow="xs">
        <WorkspaceTermsAndPolicies />
      </Card>
    </Container>
  );
};

export default () => <Layout component={Content} />;
