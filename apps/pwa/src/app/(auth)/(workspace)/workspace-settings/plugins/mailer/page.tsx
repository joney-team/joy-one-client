"use client";

import { Container } from "@/components/container";
import { renderPage } from "@/layout/layout-page";

const Mailerplugin = renderPage(() =>
  import("@/modules/plugins/mailer/plugin-mailer").then((mod) => mod.PluginMailer),
);

const Content = () => {
  return (
    <Container p="md">
      <Mailerplugin />
    </Container>
  );
};

export default Content;
