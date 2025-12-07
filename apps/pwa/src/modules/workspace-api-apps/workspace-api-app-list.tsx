"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { TeammatesIllustration } from "@/components/illustrations/teammates";
import { EventType } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useFetch } from "@/utils/use-fetch.util";
import { Trans } from "@lingui/react/macro";
import { Card, Center, Grid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { type FC } from "react";
import { WorkspaceApiAppCard } from "./workspace-api-app-card";
import { OnModalWorkspaceApiApp } from "./workspace-api-app-modal";
import { getWorkspaceApiApps } from "./workspace-api-apps-service";

export const WorkspaceApiAppList: FC = () => {
  const color = useColor();

  const apps = useFetch({
    default: [],
    fetch: () => getWorkspaceApiApps({ getAll: true }).then((res) => res.data),
    refetchEvents: [
      EventType.WorkspaceApiAppCreated,
      EventType.WorkspaceApiAppUpdated,
      EventType.WorkspaceApiAppArchived,
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
                <Trans>APIs System</Trans>
              </Title>
              <Text ta="center">
                <Trans>For developers, manipulate data through APIs</Trans>
              </Text>
            </Stack>

            <Button action leftIcon={IconPlus} onClick={() => OnModalWorkspaceApiApp()}>
              <Trans>Create new</Trans>
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
          <Trans>Create new</Trans>
        </Button>
      </Center>
    </Container>
  );
};
