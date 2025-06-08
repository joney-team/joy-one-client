import { type FC } from "react";
import { useColor } from "@/modules/theme/use-color";
import { OnModalWorkspaceApiApp } from "./workspace-api-app-modal";
import { Container } from "@/components/container";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { TeammatesIllustration } from "@/components/illustrations/teammates";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { getWorkspaceApiApps } from "./workspace-api-apps-service";
import { useFetch } from "@/utils/use-fetch.util";
import { Card, Center, Grid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { WorkspaceApiAppCard } from "./workspace-api-app-card";

export const WorkspaceApiAppList: FC = () => {
  const color = useColor();

  const apps = useFetch({
    default: [],
    fetch: () => getWorkspaceApiApps({ getAll: true }).then((res) => res.data),
    events: [
      EventType.WORKSPACE_API_APP_CREATED,
      EventType.WORKSPACE_API_APP_UPDATED,
      EventType.WORKSPACE_API_APP_ARCHIVED,
    ],
  });

  if (apps.isFetching) return <Skeleton height={200} />;
  if (apps.error) return <Errored error={apps.error} />;

  if (apps.data?.length === 0)
    return (
      <Stack p={16}>
        <Card p={50}>
          <Stack align="center" gap={30}>
            <TeammatesIllustration width={300} />
            <Stack gap={10}>
              <Title ta="center" fz={20} c={color("primary")}>
                {t("workspaceSettingsApiApps")}
              </Title>
              <Text ta="center">{t("workspaceSettingsApiAppsDesc")}</Text>
            </Stack>

            <Button action leftIcon={IconPlus} onClick={() => OnModalWorkspaceApiApp()}>
              {t("create_new")}
            </Button>
          </Stack>
        </Card>
      </Stack>
    );

  return (
    <Container size="lg" p={16}>
      <Grid justify="center">
        {apps.data?.map((app) => (
          <Grid.Col span={4} key={app._id}>
            <WorkspaceApiAppCard key={app._id} app={app} />
          </Grid.Col>
        ))}
      </Grid>

      <Center>
        <Button action leftIcon={IconPlus} onClick={() => OnModalWorkspaceApiApp()}>
          {t("create_new")}
        </Button>
      </Center>
    </Container>
  );
};
