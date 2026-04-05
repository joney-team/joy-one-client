"use client";

import { Button } from "@/components/buttons/button";
import { SectionTitle } from "@/components/session-title";
import { Card, Group, Stack } from "@mantine/core";
import { IconReportAnalytics, IconTools } from "@tabler/icons-react";

import { AdminAction } from "@/graphql/enums.graphql";
import { useApolloClient } from "@apollo/client/react";
import { type FC } from "react";
import AdminActionDocument from "./graphql/adminAction.graphql";

export const AdminTools: FC = () => {
  const client = useApolloClient();

  return (
    <Stack p="md">
      <SectionTitle name="System Actions" icon={IconTools} />
      <Card shadow="xs">
        <Stack align="start">
          <Button
            color="red"
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.ResetCache },
              })
            }
          >
            Redis | Reset Cache
          </Button>

          <Button
            color="teal"
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.SearchReindex },
              })
            }
          >
            Search | Re-Index All
          </Button>
        </Stack>
      </Card>

      <SectionTitle name="Migrations" icon={IconTools} />
      <Card shadow="xs">
        <Stack align="stretch" maw={220}>
          <Button
            justify="start"
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.SyncReceipts },
              })
            }
          >
            Sync All Receipts
          </Button>

          <Button
            justify="start"
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.SyncLoans },
              })
            }
          >
            Sync All Loans
          </Button>

          <Button
            justify="start"
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.AggregateWorkspaceStats },
              })
            }
          >
            Aggregate Workspace Stats
          </Button>
        </Stack>
      </Card>

      <SectionTitle name="Reports" icon={IconReportAnalytics} />
      <Card shadow="xs">
        <Group>
          <Button
            color="red"
            variant="outline"
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.PureReports },
              })
            }
          >
            Purge Reports
          </Button>
        </Group>
      </Card>
    </Stack>
  );
};
