"use client";

import { Container } from "@/components/container";
import { Layout, renderPage } from "@/layout/layout-page";
import { Card } from "@mantine/core";

const PluginZaloOAs = renderPage(() => import("@/components/plugins/plugin-zalo-oas").then((mod) => mod.PluginZaloOAs));

const Content = () => {
  return (
    <Container p={16}>
      <Card shadow="xs" p={20}>
        <PluginZaloOAs />
      </Card>
    </Container>
  );
};

export default () => <Layout component={Content} />;
