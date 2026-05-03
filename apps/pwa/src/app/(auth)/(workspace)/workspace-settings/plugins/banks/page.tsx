"use client";

import { Container } from "@/components/container";
import { renderPage } from "@/layout/layout-page";

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

export default Content;
