"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";

const Mailerplugin = renderPage(() => import("@/components/plugins/plugin-mailer").then((mod) => mod.PluginMailer));

const Content = () => {
  return (
    <Container p={16}>
      <Mailerplugin />
    </Container>
  );
};

export default () => <Layout component={Content} />;
