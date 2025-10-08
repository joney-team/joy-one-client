"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";

const Mailerplugin = renderPage(() =>
  import("@/modules/plugins/mailer/plugin-mailer").then((mod) => mod.PluginMailer)
);

const Content = () => {
  return (
    <Container p={16}>
      <Mailerplugin />
    </Container>
  );
};

export default () => <Layout component={Content} />;
