"use client";

import { Button } from "@/components/buttons/button";
import { SectionTitle } from "@/components/session-title";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { Card, Group, Stack } from "@mantine/core";
import { IconCalendar, IconClipboard, IconReportAnalytics, IconTools } from "@tabler/icons-react";

import { AdminAction } from "@/graphql/enums.graphql";
import { useApolloClient } from "@apollo/client/react";
import { type FC } from "react";
import AdminActionDocument from "./graphql/adminAction.graphql";

export const AdminTools: FC = () => {
  const client = useApolloClient();

  return (
    <Stack p="md">
      <SectionTitle name="System Tools" icon={IconTools} />
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
        <Stack align="start">
          <Button
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
            onClick={() =>
              client.mutate({
                mutation: AdminActionDocument,
                variables: { action: AdminAction.SyncLoans },
              })
            }
          >
            Sync All Loans
          </Button>
        </Stack>
      </Card>

      <SectionTitle name="Scheduling" icon={IconCalendar} />

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

      <SectionTitle name="Modal Inputs" icon={IconClipboard} />
      <Card shadow="xs">
        <ModalInput>
          {(open) => (
            <Group align="start">
              {Object.values(InputModalType).map((type) => (
                <Button
                  key={type}
                  onClick={() =>
                    open({
                      type,
                      onDone: console.log,
                      options: [
                        { label: "Option 1", value: "option1" },
                        { label: "Option 2", value: "option2" },
                        { label: "Option 3", value: "option3" },
                      ],
                    })
                  }
                >
                  {type}
                </Button>
              ))}
            </Group>
          )}
        </ModalInput>
      </Card>
    </Stack>
  );
};
