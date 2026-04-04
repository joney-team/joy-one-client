"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";

const WorkspaceBankInformation = renderPage(() =>
  import("@/modules/workspaces/components/workspace-bank-information").then(
    (mod) => mod.WorkspaceBankInformation,
  ),
);

const Content = () => {
  return (
    <Container p="md">
      <WorkspaceBankInformation />
    </Container>
  );
};

export default () => <Layout component={Content} />;
