"use client";

import { Layout, renderPage } from "@/layout/layout-page";
import { Card, Stack } from "@mantine/core";

const WorkspaceSettingMessageBoxesIntegrations = renderPage(() =>
  import("@/modules/workspace-settings/components/workspace-setting-message-boxes-integrations").then(
    (mod) => mod.WorkspaceSettingMessageBoxesIntegrations,
  ),
);

const Content = () => {
  return (
    <Stack p="md">
      <Card p={10} shadow="xs" w="100%">
        <WorkspaceSettingMessageBoxesIntegrations />
      </Card>
    </Stack>
  );
};

export default () => <Layout component={Content} />;
