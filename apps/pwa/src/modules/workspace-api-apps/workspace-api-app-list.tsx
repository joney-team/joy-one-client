"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { TeammatesIllustration } from "@/components/illustrations/teammates";
import { EventType } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Center, Grid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { type FC } from "react";
import { useEventsListener } from "../events/event-service";
import GetWorkspaceApiAppsDocument from "./graphql/getWorkspaceApiApps.graphql";
import { WorkspaceApiAppCard } from "./workspace-api-app-card";
import { OnModalWorkspaceApiApp } from "./workspace-api-app-modal";

export const WorkspaceApiAppList: FC = () => {
  const color = useColor();

  const {
    data: apiApps,
    loading,
    error,
    refetch,
  } = useQuery(GetWorkspaceApiAppsDocument, {
    variables: {
      query: {
        getAll: true,
      },
    },
  });

  useEventsListener(
    [
      EventType.WorkspaceApiAppCreated,
      EventType.WorkspaceApiAppUpdated,
      EventType.WorkspaceApiAppArchived,
    ],
    () => refetch(),
  );

  if (loading && !apiApps) return <Skeleton height={200} />;
  if (error || !apiApps) return <Errored error={error} />;

  if (apiApps.list.total === 0)
    return (
      <Stack p="md">
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

            <Button leftIcon={IconPlus} onClick={() => OnModalWorkspaceApiApp()}>
              <Trans>Create new</Trans>
            </Button>
          </Stack>
        </Card>
      </Stack>
    );

  return (
    <Container size="lg" p="md">
      <Grid justify="center">
        {apiApps.list.results.map((app) => (
          <Grid.Col span={4} key={app._id}>
            <WorkspaceApiAppCard key={app._id} app={app} />
          </Grid.Col>
        ))}
      </Grid>

      <Center>
        <Button leftIcon={IconPlus} onClick={() => OnModalWorkspaceApiApp()}>
          <Trans>Create new</Trans>
        </Button>
      </Center>
    </Container>
  );
};
