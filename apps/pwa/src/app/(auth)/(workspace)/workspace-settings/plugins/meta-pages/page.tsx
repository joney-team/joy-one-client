"use client";

import { Container } from "@/components/container";
import { renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const PluginMetaPages = renderPage(() =>
  import("@/modules/plugins/meta-pages/plugin-meta-pages").then((mod) => mod.PluginMetaPages),
);

const Content = () => {
  return (
    <Container p="md">
      <Card shadow="xs" p={20}>
        <PluginMetaPages />
      </Card>
    </Container>
  );
};

export default Content;
