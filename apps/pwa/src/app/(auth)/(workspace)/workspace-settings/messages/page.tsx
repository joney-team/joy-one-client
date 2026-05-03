"use client";

import { renderPage } from "@/layout/layout-page";
import { Card, Skeleton, Stack } from "@mantine/core";

const WorkspaceSettingMessageBoxesIntegrations = renderPage(
  () =>
    import("@/modules/workspace-settings/components/workspace-setting-message-boxes-integrations").then(
      (mod) => mod.WorkspaceSettingMessageBoxesIntegrations,
    ),
  () => <Skeleton h={300} />,
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

export default Content;
