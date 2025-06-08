"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const PluginMetaPages = renderPage(() =>
  import("@/components/plugins/plugin-meta-pages").then((mod) => mod.PluginMetaPages)
);

const Content = () => {
  return (
    <Container p={16}>
      <Card shadow="xs" p={20}>
        <PluginMetaPages />
      </Card>
    </Container>
  );
};

export default () => <Layout component={Content} />;
