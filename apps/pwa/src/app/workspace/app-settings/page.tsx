"use client";

import { Container } from "@/components/container";
import { SessionTitle } from "@/components/session-title";
import { Layout, renderPage } from "@/layout/layout-page";
import { t } from "@/modules/lang/lang-service";
import { Card, Stack } from "@mantine/core";
import { IconApps } from "@tabler/icons-react";

const WorkspaceAppSettings = renderPage(() =>
  import("@/modules/workspace-settings/components/workspace-setting-app").then((mod) => mod.WorkspaceAppSettings)
);

const Content = () => {
  return (
    <Container p={16}>
      <Stack gap={10}>
        <SessionTitle name={t("app-settings")} icon={IconApps} />
        <Card shadow="xs">
          <WorkspaceAppSettings />
        </Card>
      </Stack>
    </Container>
  );
};

export default () => <Layout component={Content} />;
